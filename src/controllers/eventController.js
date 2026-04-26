import Event from "../models/Event.js";
import sendEventReminder from "../utils/serviceClient.js";

/**
 * Helper: extract user ID safely
 */
const getUserId = (req) => req.user?.id || req.user?.userId;

/**
 * Helper: standard error response
 */
const handleError = (res, err) => {
  console.error("[ERROR]", {
    message: err.message,
    stack: err.stack,
  });

  return res.status(500).json({
    message: err.message || "Internal Server Error",
  });
};

/**
 * Create Event (Organizer only)
 */
const createEvent = async (req, res) => {
  try {
    const organizerId = getUserId(req);

    const event = new Event({
      ...req.body,
      organizerId,
    });

    await event.save();

    // 🔥 Inter-service communication with logging
    let reminderSent = true;

    console.info("[SERVICE CALL] Sending event reminder", {
      service: "notification-service",
      eventId: event._id,
      title: event.title,
      date: event.date,
    });

    // Extract token from the incoming request
    const token = req.headers.authorization?.split(" ")[1];

    console.info(token, "Token extracted in createEvent"); // Debug log for token

    try {
      const response = await sendEventReminder(event, token);

      console.info("[SERVICE RESPONSE] Notification service success", {
        service: "notification-service",
        eventId: event._id,
        response: response || "No response body",
      });
    } catch (serviceError) {
      console.warn("[SERVICE ERROR] Notification service failed", {
        service: "notification-service",
        eventId: event._id,
        error: serviceError.message,
      });

      reminderSent = false; // keep main flow intact
    }

    return res.status(201).json({
      message: "Event created successfully",
      event,
      reminderSent,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

/**
 * Get All Events (Search + Filter)
 */
const getAllEvents = async (req, res) => {
  try {
    const { search, date } = req.query;

    const query = {
      ...(search && { title: { $regex: search, $options: "i" } }),
      ...(date && { date: { $gte: new Date(date) } }),
    };

    const events = await Event.find(query).sort({ date: 1 }).lean();

    return res.json(events);
  } catch (err) {
    return handleError(res, err);
  }
};

/**
 * Get Event by ID
 */
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).lean();

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.json(event);
  } catch (err) {
    return handleError(res, err);
  }
};

/**
 * Update Event (Organizer only)
 */
const updateEvent = async (req, res) => {
  try {
    const userId = getUserId(req);

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organizerId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(event, req.body);

    await event.save();

    return res.json({
      message: "Event updated",
      event,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

/**
 * Delete Event (Organizer only)
 */
const deleteEvent = async (req, res) => {
  try {
    const userId = getUserId(req);

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organizerId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await event.deleteOne();

    return res.json({
      message: "Event deleted",
    });
  } catch (err) {
    return handleError(res, err);
  }
};

/**
 * Check Event Availability (Public)
 */
const checkAvailability = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).lean();

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const remaining = event.capacity;

    return res.json({
      eventId: event._id,
      remaining,
      capacity: event.capacity,
      message: "Availability checked successfully",
    });
  } catch (err) {
    return handleError(res, err);
  }
};

export {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  checkAvailability,
};
