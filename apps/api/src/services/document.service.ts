import { prisma } from "@eduverse/db";
import { logger } from "../utils/logger";
import * as crypto from "crypto";
import { DOCUMENT_TEMPLATES } from "@eduverse/shared";

// In production, would use puppeteer or similar to generate PDFs
// For now, this is a stub that would integrate with PDF generation library

export class DocumentService {
  async generateDocument(
    type: string,
    templateData: Record<string, any>,
    generatedBy: string,
    generatedFor: string
  ) {
    // Generate document based on type
    let documentContent = "";
    let fileUrl = "";

    switch (type) {
      case DOCUMENT_TEMPLATES.ATTENDANCE_CERTIFICATE:
        documentContent = await this.generateAttendanceCertificate(templateData);
        break;
      case DOCUMENT_TEMPLATES.MARK_SHEET:
        documentContent = await this.generateMarkSheet(templateData);
        break;
      case DOCUMENT_TEMPLATES.BONAFIDE:
        documentContent = await this.generateBonafide(templateData);
        break;
      case DOCUMENT_TEMPLATES.HALL_TICKET:
        documentContent = await this.generateHallTicket(templateData);
        break;
      case DOCUMENT_TEMPLATES.COURSE_COMPLETION:
        documentContent = await this.generateCourseCompletion(templateData);
        break;
      default:
        throw new Error("Unknown document type");
    }

    // Generate PDF (stub - in production would use puppeteer/playwright)
    // fileUrl = await this.generatePDF(documentContent, type);

    // For now, store as HTML reference
    fileUrl = `/documents/${Date.now()}-${type}.html`;

    // Generate QR code and digital signature
    const qrCode = this.generateQRCode(fileUrl);
    const digitalSignature = this.generateDigitalSignature(documentContent);

    // Store document record
    const document = await prisma.document.create({
      data: {
        type,
        templateData: templateData as any,
        generatedBy,
        generatedFor,
        fileUrl,
        qrCode,
        digitalSignature,
        timestamp: new Date(),
      },
    });

    logger.info("Document generated", {
      documentId: document.id,
      type,
      generatedBy,
    });

    return document;
  }

  private async generateAttendanceCertificate(data: any): Promise<string> {
    // Template for attendance certificate
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Attendance Certificate</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .content { margin: 30px 0; }
          .footer { margin-top: 40px; text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ATTENDANCE CERTIFICATE</h1>
          <p>This is to certify that</p>
        </div>
        <div class="content">
          <p><strong>Name:</strong> ${data.studentName}</p>
          <p><strong>Roll Number:</strong> ${data.rollNo}</p>
          <p><strong>Course:</strong> ${data.courseName}</p>
          <p><strong>Semester:</strong> ${data.semester}</p>
          <p><strong>Academic Year:</strong> ${data.academicYear}</p>
          <p><strong>Attendance Percentage:</strong> ${data.attendancePercent}%</p>
        </div>
        <div class="footer">
          <p>Date: ${new Date().toLocaleDateString()}</p>
          <p>Authorized Signature</p>
        </div>
      </body>
      </html>
    `;
  }

  private async generateMarkSheet(data: any): Promise<string> {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Mark Sheet</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>MARK SHEET</h1>
        <p><strong>Name:</strong> ${data.studentName}</p>
        <p><strong>Roll Number:</strong> ${data.rollNo}</p>
        <p><strong>Semester:</strong> ${data.semester}</p>
        <table>
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Internal</th>
              <th>External</th>
              <th>Total</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            ${data.marks
              .map(
                (m: any) => `
              <tr>
                <td>${m.courseCode}</td>
                <td>${m.courseName}</td>
                <td>${m.internalMarks || "-"}</td>
                <td>${m.externalMarks || "-"}</td>
                <td>${m.totalMarks || "-"}</td>
                <td>${m.grade || "-"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <p><strong>SGPA:</strong> ${data.sgpa || "N/A"}</p>
      </body>
      </html>
    `;
  }

  private async generateBonafide(data: any): Promise<string> {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bonafide Certificate</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .content { margin: 30px 0; line-height: 1.8; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BONAFIDE CERTIFICATE</h1>
        </div>
        <div class="content">
          <p>This is to certify that <strong>${data.studentName}</strong>, 
          Roll Number <strong>${data.rollNo}</strong>, is a bonafide student 
          of our institution studying in <strong>${data.department}</strong> 
          department, <strong>Semester ${data.semester}</strong> 
          during the academic year <strong>${data.academicYear}</strong>.</p>
          <p>This certificate is issued for the purpose of <strong>${data.purpose || "official use"}</strong>.</p>
        </div>
        <div style="margin-top: 40px; text-align: right;">
          <p>Date: ${new Date().toLocaleDateString()}</p>
          <p>Authorized Signature</p>
        </div>
      </body>
      </html>
    `;
  }

  private async generateHallTicket(data: any): Promise<string> {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hall Ticket</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; border: 2px solid #000; padding: 20px; }
          .info { margin: 20px 0; }
          .exam-info { border: 1px solid #000; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>HALL TICKET</h1>
          <h2>${data.examName || "University Examination"}</h2>
        </div>
        <div class="info">
          <p><strong>Name:</strong> ${data.studentName}</p>
          <p><strong>Roll Number:</strong> ${data.rollNo}</p>
          <p><strong>Semester:</strong> ${data.semester}</p>
          <p><strong>Date of Exam:</strong> ${data.examDate}</p>
        </div>
        <div class="exam-info">
          <h3>Examination Schedule</h3>
          ${data.schedule
            .map(
              (s: any) => `
            <p><strong>${s.date}:</strong> ${s.subject} (${s.time})</p>
          `
            )
            .join("")}
        </div>
        <p style="margin-top: 30px;"><strong>Venue:</strong> ${data.venue || "As per schedule"}</p>
      </body>
      </html>
    `;
  }

  private async generateCourseCompletion(data: any): Promise<string> {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Course Completion Certificate</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .content { margin: 30px 0; line-height: 1.8; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>COURSE COMPLETION CERTIFICATE</h1>
        </div>
        <div class="content">
          <p>This is to certify that <strong>${data.studentName}</strong> 
          (Roll Number: <strong>${data.rollNo}</strong>) has successfully 
          completed the course <strong>${data.courseName}</strong> 
          (Course Code: ${data.courseCode}) with a grade of 
          <strong>${data.grade}</strong> and <strong>${data.score}%</strong> marks.</p>
          <p>Course Duration: ${data.startDate} to ${data.endDate}</p>
          <p>Completion Date: ${data.completionDate || new Date().toLocaleDateString()}</p>
        </div>
        <div style="margin-top: 40px; text-align: right;">
          <p>Date: ${new Date().toLocaleDateString()}</p>
          <p>Course Instructor</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateQRCode(url: string): string {
    // In production, would use a QR code library like 'qrcode'
    // For now, return a placeholder
    return `QR_CODE_PLACEHOLDER_${url}`;
  }

  private generateDigitalSignature(content: string): string {
    // Generate a hash for digital signature
    const hash = crypto.createHash("sha256").update(content).digest("hex");
    return hash;
  }

  async getDocument(documentId: string, userId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error("Document not found");
    }

    // Verify ownership: user must be the document recipient (generatedFor) or the generator (generatedBy)
    // For students, generatedFor is typically the student's userId
    // For admins generating documents, they can access documents they generated
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
      },
    });

    const isRecipient = document.generatedFor === userId;
    const isGenerator = document.generatedBy === userId;
    
    // If user is a student, also check if generatedFor matches their studentId
    const isStudentRecipient = user?.student && document.generatedFor === user.student.id;
    
    // Admins and super admins can access any document (for administrative purposes)
    const isAdmin = user?.role === "admin" || user?.role === "super_admin";

    if (!isRecipient && !isGenerator && !isStudentRecipient && !isAdmin) {
      throw new Error("Unauthorized: You don't have permission to access this document");
    }

    return document;
  }

  async getDocumentsForUser(userId: string, type?: string) {
    const documents = await prisma.document.findMany({
      where: {
        generatedFor: userId,
        ...(type && { type }),
      },
      orderBy: { createdAt: "desc" },
    });

    return documents;
  }
}

export const documentService = new DocumentService();

