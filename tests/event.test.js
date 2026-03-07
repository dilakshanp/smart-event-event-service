import { jest } from "@jest/globals";

import request from "supertest";
import { app } from "../src/server.js";
import Event from "../src/models/Event.js";

jest.mock("../src/models/Event.js");

describe("Event API", () => {
  const token = "Bearer faketoken";

  const mockEvent = {
    _id: "123",
    title: "Test Event",
    date: "2026-05-10",
    capacity: 100,
    organizerId: "user1",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // CREATE EVENT
  test("POST /api/events should create event", async () => {
    Event.prototype.save = jest.fn().mockResolvedValue(mockEvent);

    const res = await request(app)
      .post("/api/events")
      .set("Authorization", token)
      .send(mockEvent);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Event created successfully");
  });

  // GET ALL EVENTS
  test("GET /api/events should return events", async () => {
    Event.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([mockEvent]),
    });

    const res = await request(app).get("/api/events");

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });

  // GET EVENT BY ID
  test("GET /api/events/:id should return event", async () => {
    Event.findById = jest.fn().mockResolvedValue(mockEvent);

    const res = await request(app).get("/api/events/123");

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Test Event");
  });

  // UPDATE EVENT
  test("PUT /api/events/:id should update event", async () => {
    const saveMock = jest.fn().mockResolvedValue(mockEvent);

    Event.findById = jest.fn().mockResolvedValue({
      ...mockEvent,
      save: saveMock,
    });

    const res = await request(app)
      .put("/api/events/123")
      .set("Authorization", token)
      .send({ title: "Updated Event" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Event updated");
  });

  // DELETE EVENT
  test("DELETE /api/events/:id should delete event", async () => {
    const deleteMock = jest.fn().mockResolvedValue();

    Event.findById = jest.fn().mockResolvedValue({
      ...mockEvent,
      deleteOne: deleteMock,
    });

    const res = await request(app)
      .delete("/api/events/123")
      .set("Authorization", token);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Event deleted");
  });

  // AVAILABILITY
  test("GET /api/events/:id/availability should return capacity", async () => {
    Event.findById = jest.fn().mockResolvedValue(mockEvent);

    const res = await request(app).get("/api/events/123/availability");

    expect(res.statusCode).toBe(200);
    expect(res.body.capacity).toBe(100);
  });
});
