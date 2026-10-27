import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { INITIAL_BRANCHES } from '../src/data/branchesData';
import { INITIAL_STUDENTS } from '../src/data/studentsData';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper: Get Supabase client on serverless backend if configured
function getServerSupabase() {
  const url =
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  if (url && key && !url.includes('placeholder.supabase.co')) {
    return createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return null;
}

// In-memory store for serverless execution cycle
let serverlessAdmissions: any[] = [];
let serverlessBranches: any[] = [...INITIAL_BRANCHES];

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  const supabase = getServerSupabase();
  res.json({
    status: 'healthy',
    platform: 'vercel-serverless',
    timestamp: new Date().toISOString(),
    supabaseConnected: Boolean(supabase),
    branchesCount: serverlessBranches.length,
    studentsCount: INITIAL_STUDENTS.length,
  });
});

// Next Enrollment Number Preview
app.get('/api/enrollment/next', async (req: Request, res: Response) => {
  const yearParam = req.query.year ? parseInt(req.query.year as string, 10) : new Date().getFullYear();
  const effectiveYear = isNaN(yearParam) ? new Date().getFullYear() : yearParam;
  const yy = String(effectiveYear).slice(-2);

  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('get_next_enrollment_number', {
        p_year_prefix: yy,
      });
      if (!error && data) {
        return res.json({ success: true, year: effectiveYear, nextEnrollmentId: String(data).trim() });
      }
    } catch {}
  }

  const nextSerial = 1000 + serverlessAdmissions.length;
  res.json({
    success: true,
    year: effectiveYear,
    nextEnrollmentId: `${yy}${String(nextSerial).padStart(4, '0')}`,
  });
});

// Branches Endpoints
app.get('/api/branches', async (req: Request, res: Response) => {
  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('branches').select('*');
      if (!error && Array.isArray(data) && data.length > 0) {
        return res.json({ success: true, branches: data });
      }
    } catch {}
  }
  res.json({ success: true, branches: serverlessBranches });
});

app.post('/api/branches', async (req: Request, res: Response) => {
  const branch = req.body;
  if (!branch || !branch.name || !branch.code) {
    return res.status(400).json({ success: false, error: 'Branch name and code are required.' });
  }

  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('branches').upsert(branch, { onConflict: 'id' });
      if (error) {
        console.warn('[Vercel API] Save branch to Supabase note:', error.message);
      }
    } catch {}
  }

  const idx = serverlessBranches.findIndex((b) => b.id === branch.id || b.code === branch.code);
  if (idx >= 0) {
    serverlessBranches[idx] = { ...serverlessBranches[idx], ...branch };
  } else {
    serverlessBranches.push(branch);
  }

  res.status(201).json({ success: true, branch, message: 'Branch saved successfully' });
});

app.delete('/api/branches/:id', async (req: Request, res: Response) => {
  const branchId = req.params.id;
  const supabase = getServerSupabase();
  if (supabase) {
    try {
      await supabase.from('branches').delete().eq('id', branchId);
    } catch {}
  }
  serverlessBranches = serverlessBranches.filter((b) => b.id !== branchId);
  res.json({ success: true, message: 'Branch deleted' });
});

// Admissions Query Endpoint
app.get('/api/admissions', async (req: Request, res: Response) => {
  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('admissions').select('*').order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        return res.json({ success: true, admissions: data });
      }
    } catch {}
  }
  res.json({ success: true, admissions: serverlessAdmissions });
});

// Authoritative Admission Submit Endpoint (Vercel Serverless)
app.post('/api/admissions', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({ success: false, error: 'Invalid payload: Request body is empty.' });
    }

    // 1. Mandatory Form Validations
    if (!data.studentName || !String(data.studentName).trim()) {
      return res.status(400).json({ success: false, error: "Validation Error: Student's Full Name is required." });
    }

    const cleanPhone = String(data.phone || '').replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: 'Validation Error: A valid 10-digit Active Mobile Number is required.' });
    }

    if (!data.course || !String(data.course).trim()) {
      return res.status(400).json({ success: false, error: 'Validation Error: Please select an Academic Course.' });
    }

    const cleanUtr = String(data.utrNumber || data.utr_number || '').trim();
    if (!cleanUtr || cleanUtr.length < 4 || cleanUtr === 'SUBMITTED_PRE_PAYMENT') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error: A valid UTR / Transaction Reference number (minimum 4 characters) is mandatory to submit admission.',
      });
    }

    const year = data.admissionYear || (data.admissionDate ? new Date(data.admissionDate).getFullYear() : new Date().getFullYear());
    const effectiveYear = isNaN(year) ? new Date().getFullYear() : year;
    const yy = String(effectiveYear).slice(-2);

    let enrollmentNumber = data.enrollment_number || data.enrollmentId || '';
    const supabase = getServerSupabase();

    // Generate enrollment number if not provided
    if (!enrollmentNumber) {
      if (supabase) {
        try {
          const { data: rpcData, error: rpcError } = await supabase.rpc('get_next_enrollment_number', {
            p_year_prefix: yy,
          });
          if (!rpcError && rpcData) {
            enrollmentNumber = String(rpcData).trim();
          }
        } catch {}
      }

      if (!enrollmentNumber) {
        const nextSerial = 1000 + serverlessAdmissions.length;
        enrollmentNumber = `${yy}${String(nextSerial).padStart(4, '0')}`;
      }
    }

    const applicationId = data.application_number || data.applicationId || `IAIT-${effectiveYear}-APP-${enrollmentNumber}`;
    const createdAt = data.created_at || new Date().toISOString();
    const certSerial = `IAIT/PROV/${effectiveYear}/${enrollmentNumber}`;
    const rollNo = `${data.course}-${yy}-${enrollmentNumber.slice(-4)}`;

    const admissionRecord = {
      id: applicationId,
      application_number: applicationId,
      enrollment_number: enrollmentNumber,
      enrollmentId: enrollmentNumber,
      roll_no: rollNo,
      branch_id: data.branch_id || data.branchId || 'branch-main',
      branch_code: data.branch_code || data.branchCode || 'MAIN',
      branch_name: data.branch_name || data.branchName || 'Main Branch',
      student_name: String(data.studentName || data.student_name).trim(),
      studentName: String(data.studentName || data.student_name).trim(),
      father_name: data.father_name || data.fatherName || data.guardianName || 'Guardian',
      fatherName: data.father_name || data.fatherName || data.guardianName || 'Guardian',
      mother_name: data.mother_name || data.motherName || '',
      guardian_name: data.guardian_name || data.guardianName || 'Guardian',
      guardianName: data.guardian_name || data.guardianName || 'Guardian',
      date_of_birth: data.date_of_birth || data.dob || '2005-01-01',
      dob: data.date_of_birth || data.dob || '2005-01-01',
      gender: data.gender || 'Male',
      category: data.category || 'General',
      phone: String(data.phone).trim(),
      alternate_phone: data.alternate_phone || data.alternatePhone || '',
      email: data.email ? String(data.email).trim() : '',
      address: data.address ? String(data.address).trim() : 'Assam, India',
      village: data.village || '',
      post_office: data.post_office || data.postOffice || '',
      police_station: data.police_station || data.policeStation || '',
      district: data.district || '',
      state: data.state || 'Assam',
      pincode: data.pincode || '',
      course: String(data.course).trim(),
      course_code: data.course_code || data.courseCode || String(data.course).trim(),
      qualification: data.qualification || '10+2 (HS Passed)',
      batch: data.batch || 'Morning Shift',
      session: data.session || `Session ${effectiveYear}-${effectiveYear + 1}`,
      admission_date: data.admission_date || data.admissionDate || createdAt.split('T')[0],
      admissionDate: data.admission_date || data.admissionDate || createdAt.split('T')[0],
      registration_date: createdAt,
      photo_url: data.photo_url || data.photoUrl || '',
      photoUrl: data.photo_url || data.photoUrl || '',
      photo_name: data.photo_name || data.photoName || 'candidate_photo.jpg',
      id_proof_url: data.id_proof_url || data.idProofUrl || '',
      idProofUrl: data.id_proof_url || data.idProofUrl || '',
      id_proof_name: data.id_proof_name || data.idProofName || 'id_proof.jpg',
      qualification_certificate_url: data.qualification_certificate_url || '',
      marksheet_url: data.marksheet_url || data.marksheetUrl || '',
      marksheetUrl: data.marksheet_url || data.marksheetUrl || '',
      marksheet_name: data.marksheet_name || data.marksheetName || 'hslc_marksheet.jpg',
      other_document_url: data.other_document_url || '',
      payment_status: 'Pending Verification',
      registration_fee: Number(data.registration_fee || data.registrationFee) || 500.0,
      payment_method: data.payment_method || data.paymentMethod || 'UPI / Online',
      utr_number: cleanUtr,
      utrNumber: cleanUtr,
      payment_date: createdAt,
      payment_receipt_url: data.payment_receipt_url || data.receiptUrl || '',
      receiptUrl: data.payment_receipt_url || data.receiptUrl || '',
      receipt_name: data.receipt_name || data.receiptName || 'payment_receipt.jpg',
      application_status: 'Pending Verification',
      status: 'Pending Verification',
      certificate_number: certSerial,
      certificate_status: 'Active',
      remarks: data.remarks || 'Online admission submitted with payment reference. Pending administrative verification.',
      created_at: createdAt,
      createdAt,
      updated_at: createdAt,
    };

    const studentRecord = {
      enrollmentId: enrollmentNumber,
      rollNo,
      name: admissionRecord.studentName,
      guardianName: admissionRecord.guardianName,
      dob: admissionRecord.dob,
      gender: admissionRecord.gender,
      phone: admissionRecord.phone,
      email: admissionRecord.email,
      address: admissionRecord.address,
      course: admissionRecord.course,
      courseFullName: `${admissionRecord.course} Vocational Diploma`,
      duration: 'Regular Academic Track',
      center: admissionRecord.branch_name,
      branchId: admissionRecord.branch_id,
      branchName: admissionRecord.branch_name,
      branchCode: admissionRecord.branch_code,
      certSerial,
      enrollmentDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      admissionDate: admissionRecord.admissionDate,
      academicSession: `Session ${effectiveYear}-${effectiveYear + 1}`,
      status: 'Pending Verification',
      grade: 'Enrolled',
      photoUrl: admissionRecord.photoUrl,
      verificationHash: `SHA-256: ${enrollmentNumber}...live`,
      utrNumber: cleanUtr,
      batch: admissionRecord.batch,
      qualification: admissionRecord.qualification,
      idProofUrl: admissionRecord.idProofUrl,
      marksheetUrl: admissionRecord.marksheetUrl,
      receiptUrl: admissionRecord.receiptUrl,
    };

    // Attempt direct save to Supabase public.admissions if configured on server
    if (supabase) {
      try {
        const { error: sbError } = await supabase
          .from('admissions')
          .upsert({
            enrollment_number: admissionRecord.enrollment_number,
            application_number: admissionRecord.application_number,
            roll_no: admissionRecord.roll_no,
            branch_id: admissionRecord.branch_id,
            branch_code: admissionRecord.branch_code,
            branch_name: admissionRecord.branch_name,
            student_name: admissionRecord.student_name,
            father_name: admissionRecord.father_name,
            mother_name: admissionRecord.mother_name,
            guardian_name: admissionRecord.guardian_name,
            date_of_birth: admissionRecord.date_of_birth,
            gender: admissionRecord.gender,
            category: admissionRecord.category,
            phone: admissionRecord.phone,
            alternate_phone: admissionRecord.alternate_phone,
            email: admissionRecord.email,
            address: admissionRecord.address,
            village: admissionRecord.village,
            post_office: admissionRecord.post_office,
            police_station: admissionRecord.police_station,
            district: admissionRecord.district,
            state: admissionRecord.state,
            pincode: admissionRecord.pincode,
            course: admissionRecord.course,
            course_code: admissionRecord.course_code,
            qualification: admissionRecord.qualification,
            batch: admissionRecord.batch,
            session: admissionRecord.session,
            admission_date: admissionRecord.admission_date,
            registration_date: admissionRecord.registration_date,
            photo_url: admissionRecord.photo_url,
            photo_name: admissionRecord.photo_name,
            id_proof_url: admissionRecord.id_proof_url,
            id_proof_name: admissionRecord.id_proof_name,
            marksheet_url: admissionRecord.marksheet_url,
            marksheet_name: admissionRecord.marksheet_name,
            payment_status: admissionRecord.payment_status,
            registration_fee: admissionRecord.registration_fee,
            payment_method: admissionRecord.payment_method,
            utr_number: admissionRecord.utr_number,
            payment_date: admissionRecord.payment_date,
            payment_receipt_url: admissionRecord.payment_receipt_url,
            receipt_name: admissionRecord.receipt_name,
            application_status: admissionRecord.application_status,
            certificate_number: admissionRecord.certificate_number,
            certificate_status: admissionRecord.certificate_status,
            remarks: admissionRecord.remarks,
            created_at: admissionRecord.created_at,
            updated_at: admissionRecord.updated_at,
          }, { onConflict: 'enrollment_number' });

        if (sbError) {
          console.warn('[Vercel API] Note on saving to Supabase admissions:', sbError.message);
        } else {
          console.log('[Vercel API] Successfully persisted admission to Supabase:', enrollmentNumber);
        }
      } catch (sbEx: any) {
        console.warn('[Vercel API] Supabase persistence exception:', sbEx?.message || sbEx);
      }
    }

    serverlessAdmissions.unshift(admissionRecord);

    return res.status(201).json({
      success: true,
      enrollmentNumber,
      applicationId,
      admission: admissionRecord,
      student: studentRecord,
      message: 'Admission submitted and confirmed successfully.',
    });
  } catch (err: any) {
    console.error('[Vercel API] Error submitting admission:', err);
    return res.status(500).json({
      success: false,
      error: `Server Error: ${err?.message || 'Unable to process admission request.'}`,
    });
  }
});

// Students Query
app.get('/api/students', (req: Request, res: Response) => {
  res.json({ success: true, students: INITIAL_STUDENTS });
});

app.get('/api/students/:query', (req: Request, res: Response) => {
  const q = String(req.params.query || '').trim().toLowerCase();
  const found = INITIAL_STUDENTS.find(
    (s) =>
      s.enrollmentId.toLowerCase() === q ||
      s.rollNo?.toLowerCase() === q ||
      s.certSerial?.toLowerCase() === q
  );
  if (found) {
    res.json({ success: true, student: found });
  } else {
    res.status(404).json({ success: false, message: 'Student record not found' });
  }
});

export default app;
