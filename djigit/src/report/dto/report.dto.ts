export class UserDto {
    id: number;
    email: string;
}
  
export class ReportDto {
id: number;
licensePlate: string;
description: string;
latitude: number;
longitude: number;
createdAt: Date;
imageUrls?: string[];
videoUrl?: string;
reportedBy: UserDto;
}
  