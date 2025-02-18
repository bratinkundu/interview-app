import { DataSource } from "typeorm";
import { Answer } from "@/models/Answers";
import { Interview } from "@/models/Interview";
import { User } from "@/models/Users";

export class Database {
    private static instance: DataSource;
    private constructor() {}
  
    public static getInstance(): DataSource {
      if (!Database.instance) {
        try {
          Database.instance = new DataSource({
            type: "postgres",
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            synchronize: false, 
            entities: [User, Answer, Interview],
          });

        } catch (error) {
          console.error('Failed to create database instance:', error);
          throw error;
        }
      }
      return Database.instance;
    }
}