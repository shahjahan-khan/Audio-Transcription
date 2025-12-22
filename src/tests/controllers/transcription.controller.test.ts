import { Request, Response, NextFunction } from "express";
import TranscriptionController from "../../controllers/transcription.controller";
import { AppError } from "../../middleware/errorHandler";

// Mock the appDependencies module
jest.mock("../../appDependencies", () => ({
  transciptionService: {
    createTranscription: jest.fn(),
    getTranscriptions: jest.fn(),
  },
}));

import { transciptionService } from "../../appDependencies";

describe("TranscriptionController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe("createTranscription", () => {
    it("should create transcription successfully", async () => {
      mockRequest.body = { audioUrl: "https://example.com/audio.mp3" };
      const mockRecord = { _id: { toString: () => "123456" } };
      (transciptionService.createTranscription as jest.Mock).mockResolvedValue(mockRecord);

      await TranscriptionController.createTranscription(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(transciptionService.createTranscription).toHaveBeenCalledWith("https://example.com/audio.mp3", "en-us");
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ id: "123456" });
    });

    it("should throw error when audioUrl is missing", async () => {
      mockRequest.body = {};

      await TranscriptionController.createTranscription(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: "audioUrl is required",
        })
      );
    });

    it("should throw error when transcription creation fails", async () => {
      mockRequest.body = { audioUrl: "https://example.com/audio.mp3" };
      (transciptionService.createTranscription as jest.Mock).mockResolvedValue(null);

      await TranscriptionController.createTranscription(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: "Failed to create transcription",
        })
      );
    });
  });

  describe("azureTranscription", () => {
    it("should create azure transcription successfully", async () => {
      mockRequest.body = { audioUrl: "https://example.com/audio.mp3", language: "en-US" };
      const mockRecord = { _id: { toString: () => "789012" } };
      (transciptionService.createTranscription as jest.Mock).mockResolvedValue(mockRecord);

      await TranscriptionController.azureTranscription(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(transciptionService.createTranscription).toHaveBeenCalledWith(
        "https://example.com/audio.mp3",
        "en-US",
        "azure"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ id: "789012" });
    });

    it("should throw error when audioUrl is missing", async () => {
      mockRequest.body = { language: "en-US" };

      await TranscriptionController.azureTranscription(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: "audioUrl is required",
        })
      );
    });

    it("should throw error when language is missing", async () => {
      mockRequest.body = { audioUrl: "https://example.com/audio.mp3" };

      await TranscriptionController.azureTranscription(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: "language is required",
        })
      );
    });

    it("should throw error when transcription creation fails", async () => {
      mockRequest.body = { audioUrl: "https://example.com/audio.mp3", language: "en-US" };
      (transciptionService.createTranscription as jest.Mock).mockResolvedValue(null);

      await TranscriptionController.azureTranscription(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: "Failed to create transcription",
        })
      );
    });
  });

  describe("getTranscriptions", () => {
    it("should return all transcriptions", async () => {
      const mockRecords = [
        { _id: "1", audioUrl: "url1" },
        { _id: "2", audioUrl: "url2" },
      ];
      (transciptionService.getTranscriptions as jest.Mock).mockResolvedValue(mockRecords);

      await TranscriptionController.getTranscriptions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(transciptionService.getTranscriptions).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockRecords);
    });
  });
});