import random
import sqlite3
from datetime import datetime, timedelta
from enum import Enum

db_path = '../dev.db'


class CoinFlip(Enum):
    tail = 0
    head = 1


class DuelResult(Enum):
    lose = 0
    win = 1


class IsGoingFirst(Enum):
    false = 0
    true = 1


VS_DECKS = [
    'Tearlament',
    'K9VS',
    'Sky Striker',
    'White Forest',
    'Maliss',
    'White Dragon',
    'Dracotail',
    'Unknown',
]

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS dc (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coin_flip TEXT NOT NULL CHECK (coin_flip IN ('head', 'tail')),
    duel_result TEXT NOT NULL CHECK (duel_result IN ('win', 'lose')),
    go_first INTEGER NOT NULL CHECK (go_first IN (0, 1)),      -- 1 (going first) or 0 (going second)
    vs_desk TEXT,
    points INTEGER,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
"""


def generate_fixtures(num_records=50, win_rate=0.65):
    INITIAL_POINTS = 100
    current_points = INITIAL_POINTS

    conn = None
    try:
        print(f'Connecting to database: {db_path}')
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()

        cur.execute(CREATE_TABLE_SQL)
        print("Ensured 'dc' table exists.")

        INSERT_SQL = """
        INSERT INTO dc (coin_flip, duel_result, go_first, vs_desk, points, created_at)
        VALUES (?, ?, ?, ?, ?, ?);
        """

        print(
            f'Generating and inserting {num_records} records with {win_rate * 100:.0f}% win rate...'
        )

        # time_end = datetime.now()
        time_end = datetime(2025, 5, 31, 23, 59, 59)
        time_start = time_end - timedelta(hours=72)
        time_range_seconds = (time_end - time_start).total_seconds()

        for i in range(num_records):
            coin_flip_val = random.choice(list(CoinFlip)).name

            if random.random() <= win_rate:
                duel_result_val = DuelResult.win.name
            else:
                duel_result_val = DuelResult.lose.name

            go_first_enum = random.choice(list(IsGoingFirst))
            go_first_val = go_first_enum.value
            vs_desk_val = random.choice(VS_DECKS)

            if duel_result_val == 'win':
                change = random.randint(990, 1200)
                current_points += change
            else:
                change = random.randint(990, 1100)
                current_points -= change

            current_points = max(0, current_points)
            points_to_save = int(round(current_points))

            time_interval = time_range_seconds / num_records
            current_time_seconds = (i + 1) * time_interval
            random_datetime = time_start + timedelta(seconds=current_time_seconds)
            timestamp_val = random_datetime.strftime('%Y-%m-%d %H:%M:%S')

            cur.execute(
                INSERT_SQL,
                (
                    coin_flip_val,
                    duel_result_val,
                    go_first_val,
                    vs_desk_val,
                    points_to_save,
                    timestamp_val,
                ),
            )

            print(
                f'#{i + 1} CoinFlip: {coin_flip_val}, Result: {duel_result_val}, GoFirst: {go_first_val}, VSDesk: {vs_desk_val}, Total Point: {points_to_save}, Time: {timestamp_val}'
            )

        conn.commit()
        print(f'Successfully inserted {num_records} fixture records.')

        cur.execute('SELECT COUNT(*) FROM dc;')
        total_rows = cur.fetchone()[0]
        print(f"Total rows in 'dc' table after insertion: {total_rows}")

    except sqlite3.Error as e:
        print(f'An error occurred: {e}')
        if conn:
            conn.rollback()

    finally:
        if conn:
            conn.close()
            print('Database connection closed.')


if __name__ == '__main__':
    generate_fixtures(num_records=230, win_rate=0.65)
