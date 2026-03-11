# Bankroll Management

## Story 1 — Add Deposit

As a poker player  
I want to record a deposit  
So that my bankroll reflects the money I added.

Acceptance Criteria

Given the user is on the bankroll page  
When the user enters a deposit amount and confirms  
Then the system stores the deposit and increases the bankroll.

---

## Story 2 — Record Withdrawal

As a poker player  
I want to record a withdrawal  
So that my bankroll reflects the money I removed.

Acceptance Criteria

Given the user has a bankroll  
When the user records a withdrawal  
Then the bankroll decreases accordingly.

---

## Story 3 — View Bankroll History

As a poker player  
I want to view my bankroll event history  
So that I can track deposits and withdrawals.

Acceptance Criteria

Given bankroll events exist  
When the user opens the bankroll history  
Then all events are displayed ordered by date.

---

## Story 4 — Edit Bankroll Event

As a poker player  
I want to edit a bankroll event  
So that I can correct mistakes.

Acceptance Criteria

Given a bankroll event exists  
When the user edits the event  
Then the bankroll recalculates automatically.

---

## Story 5 — Delete Bankroll Event

As a poker player  
I want to delete a bankroll event  
So that incorrect entries can be removed.

Acceptance Criteria

Given a bankroll event exists  
When the user deletes the event  
Then it is removed from the system.

---

# Session Management

## Story 6 — Create Poker Session

As a poker player  
I want to create a poker session  
So that I can track my playing results.

Acceptance Criteria

Given the user wants to track a session  
When the user creates a session  
Then the system stores the session with date and game mode.

---

## Story 7 — View Session List

As a poker player  
I want to see a list of my sessions  
So that I can review my playing history.

Acceptance Criteria

Given sessions exist  
When the user opens the session overview  
Then all sessions are displayed.

---

## Story 8 — View Session Details

As a poker player  
I want to view session details  
So that I can see all session information.

Acceptance Criteria

Given a session exists  
When the user selects the session  
Then the session data is displayed.

---

## Story 9 — Delete Session

As a poker player  
I want to delete a session  
So that incorrect entries can be removed.

Acceptance Criteria

Given a session exists  
When the user deletes the session  
Then it is removed from the database.

---

# Cashgame Sessions

## Story 10 — Record Cashgame Buy-in

As a poker player  
I want to record the buy-in of a cashgame session  
So that the system knows my starting amount.

Acceptance Criteria

Given a session is marked as cashgame  
When the user enters the buy-in  
Then the value is stored.

---

## Story 11 — Record Cash-out

As a poker player  
I want to record the cash-out value  
So that the system can calculate my result.

Acceptance Criteria

Given a cashgame session exists  
When the user enters the cash-out value  
Then the value is stored.

---

## Story 12 — Calculate Cashgame Profit

As a poker player  
I want the system to calculate profit automatically  
So that I do not need to calculate it manually.

Acceptance Criteria

Given buy-in and cash-out exist  
When the session is closed  
Then profit or loss is calculated automatically.

---

# Tournament Sessions

## Story 13 — Record Tournament Buy-in

As a poker player  
I want to record tournament buy-in  
So that my total cost can be calculated.

Acceptance Criteria

Given a tournament session exists  
When the user enters a buy-in  
Then the system stores the value.

---

## Story 14 — Record Tournament Fee

As a poker player  
I want to record tournament fee separately  
So that total costs are accurate.

Acceptance Criteria

Given a tournament session exists  
When the user enters the fee  
Then the fee is stored separately.

---

## Story 15 — Record Rebuys and Add-ons

As a poker player  
I want to record rebuys and add-ons  
So that additional costs are included.

Acceptance Criteria

Given a tournament session exists  
When the user records rebuys or add-ons  
Then the costs are added to the session.

---

## Story 16 — Record Tournament Winnings

As a poker player  
I want to record tournament winnings  
So that the system calculates my profit or loss.

Acceptance Criteria

Given a tournament session exists  
When the user enters winnings  
Then the system calculates the session result.

---

# Statistics

## Story 17 — View Total Profit

As a poker player  
I want to see my total profit or loss  
So that I can evaluate my performance.

Acceptance Criteria

Given sessions exist  
When the statistics page opens  
Then total profit is displayed.

---

## Story 18 — Bankroll Development Graph

As a poker player  
I want to see a bankroll development graph  
So that I can analyze my performance over time.

Acceptance Criteria

Given bankroll events exist  
When the statistics page loads  
Then a bankroll chart is displayed.

---

## Story 19 — Sessions Per Month

As a poker player  
I want to see sessions per month  
So that I can track my playing volume.

Acceptance Criteria

Given sessions exist  
When statistics are shown  
Then the number of sessions per month is displayed.

---

## Story 20 — Filter Statistics

As a poker player  
I want to filter statistics by date  
So that I can analyze specific time periods.

Acceptance Criteria

Given statistics exist  
When the user selects a date range  
Then the statistics update accordingly.

---

# Reporting

## Story 21 — Export Session Data

As a poker player  
I want to export session data  
So that I can analyze it externally.

Acceptance Criteria

Given session data exists  
When the user exports the data  
Then a CSV file is generated.

---

## Story 22 — Export Bankroll Events

As a poker player  
I want to export bankroll events  
So that I can keep external records.

Acceptance Criteria

Given bankroll events exist  
When the user exports them  
Then the system generates a CSV file.

---

# Frontend / UX

## Story 23 — Dashboard

As a poker player  
I want a dashboard with key statistics  
So that I can quickly see my bankroll and performance.

Acceptance Criteria

Given the user opens the application  
When the dashboard loads  
Then key metrics are displayed.

---

## Story 24 — Navigation

As a poker player  
I want clear navigation between sections  
So that I can easily access bankroll, sessions, and statistics.

Acceptance Criteria

Given the user uses the application  
When navigating between pages  
Then the interface remains clear and consistent.

---

## Story 25 — Input Validation

As a poker player  
I want form validation  
So that I do not enter invalid data.

Acceptance Criteria

Given a user enters invalid input  
When submitting the form  
Then the system shows an error message.

---

## Story 26 — Responsive Layout

As a poker player  
I want the interface to work on different screen sizes  
So that I can use the application comfortably.

Acceptance Criteria

Given the application is opened on different devices  
When the interface loads  
Then the layout adapts to the screen size.

---

# Optional Feature — Blackjack Trainer

## Story 27 — Blackjack Scenario

As a user  
I want to receive a blackjack decision scenario  
So that I can practice correct strategy.

Acceptance Criteria

Given the trainer is active  
When a scenario appears  
Then the user can select an action.

---

## Story 28 — Blackjack Feedback

As a user  
I want feedback on my blackjack decision  
So that I can learn the correct move.

Acceptance Criteria

Given a decision is made  
When the system evaluates it  
Then it displays whether the decision was correct.