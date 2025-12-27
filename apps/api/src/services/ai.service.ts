import { prisma } from "@eduverse/db";
import { logger } from "../utils/logger";
import OpenAI from "openai";

// Validate OpenAI API key at initialization
const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey || openaiApiKey.trim() === "") {
  logger.warn("OPENAI_API_KEY is not set. AI features will not work.");
}

const openai = openaiApiKey ? new OpenAI({
  apiKey: openaiApiKey,
}) : null as unknown as OpenAI; // Type assertion for optional AI features

export class AIService {
  async chatWithAssistant(
    userId: string,
    role: string,
    message: string,
    sessionId?: string
  ) {
    // Get or create chat session
    let session = sessionId
      ? await prisma.chatSession.findUnique({
          where: { id: sessionId },
        })
      : null;

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          userId,
          title: message.substring(0, 50),
        },
      });
    }

    // Store user message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "user",
        content: message,
      },
    });

    // Get user context based on role
    const context = await this.getUserContext(userId, role);

    // Perform RAG retrieval (simplified - in production would use vector DB)
    const relevantDocs = await this.retrieveRelevantDocuments(
      message,
      userId,
      role
    );

    // Build prompt with context
    const systemPrompt = this.buildSystemPrompt(role, context, relevantDocs);
    const userPrompt = message;

    // Call OpenAI
    let assistantResponse = "";
    try {
      if (!openaiApiKey) {
        throw new Error("OpenAI API key is not configured");
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      assistantResponse = completion.choices[0]?.message?.content || "";
    } catch (error) {
      logger.error("OpenAI API error", { error });
      assistantResponse =
        "I apologize, but I'm experiencing technical difficulties. Please try again later.";
    }

    // Store assistant response
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "assistant",
        content: assistantResponse,
        retrievedDocs: relevantDocs.length > 0 ? relevantDocs : undefined,
      },
    });

    return {
      sessionId: session.id,
      message: assistantMessage,
      retrievedDocs: relevantDocs,
    };
  }

  private async getUserContext(userId: string, role: string) {
    if (role === "student") {
      const student = await prisma.student.findUnique({
        where: { userId },
        include: {
          enrollments: {
            include: {
              course: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
          attendance: {
            include: {
              course: {
                select: { name: true },
              },
            },
          },
          fees: {
            take: 1,
            orderBy: { semester: "desc" },
          },
        },
      });

      if (!student) return null;

      const attendancePercent = await this.calculateAttendancePercent(
        student.id
      );

      return {
        student: {
          rollNo: student.rollNo,
          semester: student.semester,
          courses: student.enrollments.map((e) => e.course.name),
        },
        attendance: attendancePercent,
        fees: student.fees[0]
          ? {
              status: student.fees[0].status,
              dueAmount: student.fees[0].dueAmount,
            }
          : null,
      };
    } else if (role === "teacher") {
      const teacher = await prisma.teacher.findUnique({
        where: { userId },
        include: {
          courses: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      return teacher
        ? {
            teacher: {
              empId: teacher.empId,
              department: teacher.department,
              courses: teacher.courses,
            },
          }
        : null;
    }

    return null;
  }

  private async calculateAttendancePercent(studentId: string): Promise<number> {
    const attendance = await prisma.attendance.findMany({
      where: { studentId },
    });

    if (attendance.length === 0) return 100;

    const present = attendance.filter((a) => a.status === "present").length;
    return Math.round((present / attendance.length) * 100);
  }

  private async retrieveRelevantDocuments(
    query: string,
    userId: string,
    role: string
  ): Promise<any[]> {
    // Simplified RAG - in production would:
    // 1. Generate embeddings for query
    // 2. Search vector DB (Pinecone/Weaviate) for similar chunks
    // 3. Filter by role-based permissions
    // 4. Return top-k relevant documents

    // For now, return empty array
    return [];
  }

  private buildSystemPrompt(
    role: string,
    context: any,
    relevantDocs: any[]
  ): string {
    let prompt = `You are EduBot, an AI assistant for the EduVerse educational platform.`;

    if (role === "student") {
      prompt += ` You are helping a student.`;
      if (context) {
        prompt += `\nStudent Context:
- Roll Number: ${context.student.rollNo}
- Semester: ${context.student.semester}
- Enrolled Courses: ${context.student.courses.join(", ")}
- Attendance: ${context.attendance}%`;
      }
      prompt += `\nHelp the student with course-related questions, assignments, attendance status, and fee information.`;
    } else if (role === "teacher") {
      prompt += ` You are helping a teacher.`;
      if (context) {
        prompt += `\nTeacher Context:
- Department: ${context.teacher.department}
- Courses: ${context.teacher.courses.map((c: any) => c.name).join(", ")}`;
      }
      prompt += `\nHelp the teacher with course management, student analytics, report generation, and administrative tasks.`;
    }

    if (relevantDocs.length > 0) {
      prompt += `\n\nRelevant Documents:\n${relevantDocs
        .map((doc) => `- ${doc.title}: ${doc.excerpt}`)
        .join("\n")}`;
    }

    prompt += `\n\nProvide helpful, accurate, and concise responses. If you don't know something, say so.`;

    return prompt;
  }

  async generateQuizQuestions(
    content: string,
    numQuestions: number = 10,
    difficulty: "easy" | "medium" | "hard" = "medium"
  ) {
    const prompt = `Generate ${numQuestions} multiple choice questions (MCQ) based on the following content. Difficulty level: ${difficulty}.

For each question, provide:
1. Question text
2. 4 options (A, B, C, D)
3. Correct answer (A, B, C, or D)
4. Brief explanation

Format as JSON array:
[
  {
    "question": "Question text?",
    "options": {
      "A": "Option A",
      "B": "Option B",
      "C": "Option C",
      "D": "Option D"
    },
    "correctAnswer": "A",
    "explanation": "Brief explanation"
  }
]

Content:
${content}`;

    try {
      if (!openaiApiKey) {
        throw new Error("OpenAI API key is not configured. Quiz generation requires OpenAI API access.");
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content:
              "You are an educational content generator. Generate well-structured quiz questions in JSON format.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(response);

      // Handle both array and object formats
      const questions = Array.isArray(parsed)
        ? parsed
        : parsed.questions || parsed.questionsArray || [];

      return questions.slice(0, numQuestions);
    } catch (error) {
      logger.error("Quiz generation error", { error });
      throw new Error("Failed to generate quiz questions");
    }
  }

  async generateSummary(
    content: string,
    maxLength: number = 200
  ): Promise<string> {
    const prompt = `Summarize the following content in approximately ${maxLength} words. Focus on key points and main ideas.

Content:
${content}`;

    try {
      if (!openaiApiKey) {
        throw new Error("OpenAI API key is not configured. Summary generation requires OpenAI API access.");
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are a content summarizer. Provide concise, accurate summaries.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: Math.ceil(maxLength * 1.5),
        temperature: 0.3,
      });

      return completion.choices[0]?.message?.content || "";
    } catch (error) {
      logger.error("Summary generation error", { error });
      throw new Error("Failed to generate summary");
    }
  }
}

export const aiService = new AIService();

