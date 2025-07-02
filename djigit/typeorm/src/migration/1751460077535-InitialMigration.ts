import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1751460077535 implements MigrationInterface {
    name = 'InitialMigration1751460077535'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "report" ADD "licensePlate" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "report" ADD "latitude" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "report" ADD "longitude" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "report" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "report" ADD "imageUrl" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "report" ADD "videoUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "report" DROP COLUMN "videoUrl"`);
        await queryRunner.query(`ALTER TABLE "report" DROP COLUMN "imageUrl"`);
        await queryRunner.query(`ALTER TABLE "report" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "report" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "report" DROP COLUMN "latitude"`);
        await queryRunner.query(`ALTER TABLE "report" DROP COLUMN "licensePlate"`);
    }

}
