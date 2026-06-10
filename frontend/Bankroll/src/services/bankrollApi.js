const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/**
 * Get all bankroll events for a user
 */
export async function getBankrollEventsByUser(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/bankroll-events/user/${userId}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error("Error fetching bankroll events:", error);
    return [];
  }
}

/**
 * Create a new bankroll event (deposit or withdrawal)
 */
export async function createBankrollEvent(userId, amount, eventType, notes = "") {
  try {
    const params = new URLSearchParams({
      amount: amount,
      event_type: eventType,
      notes: notes || "",
    });

    const response = await fetch(
      `${API_BASE_URL}/bankroll-events/${userId}?${params}`,
      { method: "POST" }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error creating bankroll event:", error);
    throw error;
  }
}
