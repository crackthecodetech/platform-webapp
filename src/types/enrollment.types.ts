import { Enrollment } from "@/generated/prisma";

export interface EnrollmentWithUser extends Enrollment {
    user: {
        username: string;
    };
}
