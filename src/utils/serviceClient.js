import axios from "axios";

const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://127.0.0.1:3006";

const sendEventReminder = async (event, token) => {
  const startTime = Date.now();

  console.info(token, "Token received in sendEventReminder"); // Debug log for token

  const payload = {
    eventId: event._id.toString(),
    title: event.title,
    date: event.date,
    location: event.location,
    message: `🔔 Reminder: Your event "${event.title}" is scheduled for ${new Date(
      event.date,
    ).toLocaleDateString()} at ${event.location}`,
  };

  console.info("[SERVICE CALL START] Notification Service", {
    service: "notification-service",
    url: `${NOTIFICATION_SERVICE_URL}/api/notifications/event-reminder`,
    eventId: payload.eventId,
    title: payload.title,
  });

  try {
    const response = await axios.post(
      `${NOTIFICATION_SERVICE_URL}/api/notifications/event-reminder`,
      payload,
      {
        timeout: 5000,
        headers: {
          Authorization: `Bearer ${token}`, // ✅ forward the token
        },
      },
    );

    const duration = Date.now() - startTime;

    console.info("[SERVICE CALL SUCCESS] Notification Service", {
      service: "notification-service",
      eventId: payload.eventId,
      status: response.status,
      statusText: response.statusText,
      duration: `${duration}ms`,
      responseData: response.data || "No response body",
    });

    console.log(
      `✅ Reminder sent successfully for event: ${event.title} (${duration}ms)`,
    );

    return response.data;
  } catch (err) {
    const duration = Date.now() - startTime;

    console.warn("[SERVICE CALL FAILED] Notification Service", {
      service: "notification-service",
      eventId: payload.eventId,
      duration: `${duration}ms`,
      errorMessage: err.message,
      status: err.response?.status,
      responseData: err.response?.data,
    });

    console.warn(
      `⚠️ Could not send reminder (non-blocking) for event: ${event.title}`,
    );
  }
};

export default sendEventReminder;
