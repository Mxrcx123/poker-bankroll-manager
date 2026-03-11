users
- id (PK)
- username
- email
- created_at

bankroll_events
- id (PK)
- user_id (FK > users.id)
- type
- amount
- date

sessions
- id (PK)
- user_id (FK > users.id)
- date
- game_mode
- platform
- notes

cash_sessions
- session_id (PK, FK > sessions.id)
- buy_in
- cash_out

tournament_sessions
- session_id (PK, FK > sessions.id)
- buy_in
- fee
- rebuy_cost
- add_on_cost
- winnings