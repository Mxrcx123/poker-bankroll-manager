const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/**
 * Get all sessions for a user
 */
export async function getSessionsByUser(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/user/${userId}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.sessions || [];
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }
}

/**
 * Get a single session
 */
export async function getSession(sessionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching session:", error);
    return null;
  }
}

/**
 * Create a new cash game session
 */
export async function createCashGameSession(userId, gameModeId, data) {
  try {
    const params = new URLSearchParams({
      buy_in: data.buy_in,
      cash_out: data.cash_out || "",
      platform_id: data.platform_id || "",
      notes: data.notes || "",
    });

    const response = await fetch(
      `${API_BASE_URL}/sessions/${userId}/${gameModeId}/cashgame?${params}`,
      { method: "POST" }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error creating cash game session:", error);
    throw error;
  }
}

/**
 * Create a new tournament session
 */
export async function createTournamentSession(userId, gameModeId, data) {
  try {
    const params = new URLSearchParams({
      buy_in: data.buy_in,
      fee: data.fee || "",
      rebuys: data.rebuys || 0,
      rebuy_cost: data.rebuy_cost || "",
      add_ons: data.add_ons || 0,
      add_on_cost: data.add_on_cost || "",
      winnings: data.winnings || 0,
      finish_position: data.finish_position || "",
      platform_id: data.platform_id || "",
      notes: data.notes || "",
    });

    const response = await fetch(
      `${API_BASE_URL}/sessions/${userId}/${gameModeId}/tournament?${params}`,
      { method: "POST" }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error creating tournament session:", error);
    throw error;
  }
}

/**
 * Update a cash game session
 */
export async function updateCashGameSession(sessionId, data) {
  try {
    const params = new URLSearchParams();
    if (data.buy_in !== undefined) params.append("buy_in", data.buy_in);
    if (data.cash_out !== undefined) params.append("cash_out", data.cash_out);
    if (data.platform_id !== undefined) params.append("platform_id", data.platform_id);
    if (data.ended_at !== undefined) params.append("ended_at", data.ended_at);
    if (data.notes !== undefined) params.append("notes", data.notes);

    const response = await fetch(
      `${API_BASE_URL}/sessions/${sessionId}/cashgame?${params}`,
      { method: "PUT" }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error updating cash game session:", error);
    throw error;
  }
}

/**
 * Update a tournament session
 */
export async function updateTournamentSession(sessionId, data) {
  try {
    const params = new URLSearchParams();
    if (data.buy_in !== undefined) params.append("buy_in", data.buy_in);
    if (data.fee !== undefined) params.append("fee", data.fee);
    if (data.rebuys !== undefined) params.append("rebuys", data.rebuys);
    if (data.rebuy_cost !== undefined) params.append("rebuy_cost", data.rebuy_cost);
    if (data.add_ons !== undefined) params.append("add_ons", data.add_ons);
    if (data.add_on_cost !== undefined) params.append("add_on_cost", data.add_on_cost);
    if (data.winnings !== undefined) params.append("winnings", data.winnings);
    if (data.finish_position !== undefined) params.append("finish_position", data.finish_position);
    if (data.platform_id !== undefined) params.append("platform_id", data.platform_id);
    if (data.ended_at !== undefined) params.append("ended_at", data.ended_at);
    if (data.notes !== undefined) params.append("notes", data.notes);

    const response = await fetch(
      `${API_BASE_URL}/sessions/${sessionId}/tournament?${params}`,
      { method: "PUT" }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error updating tournament session:", error);
    throw error;
  }
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error deleting session:", error);
    throw error;
  }
}
