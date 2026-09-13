import sqlite3
import json
import os
import uuid
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(__file__), "mine_ar.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()

    # 1. Workers / Trainees Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS workers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        mine_location TEXT NOT NULL,
        level INTEGER NOT NULL,
        level_title TEXT NOT NULL,
        xp INTEGER NOT NULL,
        progress_pct INTEGER NOT NULL,
        competency_score REAL NOT NULL,
        avatar_url TEXT NOT NULL,
        streaks INTEGER NOT NULL,
        notifications_count INTEGER NOT NULL,
        language TEXT NOT NULL,
        voice_guidance INTEGER NOT NULL,
        sound_fx INTEGER NOT NULL
    )
    """)

    # 2. Scenarios Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS scenarios (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        hazard_type TEXT NOT NULL,
        location TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        description TEXT NOT NULL,
        time_limit_sec INTEGER NOT NULL,
        correct_equipment TEXT NOT NULL,
        correct_approach TEXT NOT NULL,
        pass_steps_required TEXT NOT NULL
    )
    """)

    # 3. Attempts Table (AR Scenarios)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS attempts (
        id TEXT PRIMARY KEY,
        worker_id TEXT NOT NULL,
        scenario_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        duration_ms INTEGER NOT NULL,
        hazard_rec_ms INTEGER NOT NULL,
        equipment_selected TEXT NOT NULL,
        approach_position TEXT NOT NULL,
        pass_steps TEXT NOT NULL,
        mistakes TEXT NOT NULL,
        xp_awarded INTEGER NOT NULL,
        accuracy_score REAL NOT NULL,
        speed_score REAL NOT NULL,
        procedure_score REAL NOT NULL,
        hazard_rec_score REAL NOT NULL,
        competency_score REAL NOT NULL,
        passed INTEGER NOT NULL,
        FOREIGN KEY (worker_id) REFERENCES workers(id)
    )
    """)

    # 4. Badges Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS badges (
        id TEXT PRIMARY KEY,
        worker_id TEXT NOT NULL,
        badge_key TEXT NOT NULL,
        badge_title TEXT NOT NULL,
        icon TEXT NOT NULL,
        description TEXT NOT NULL,
        unlocked_at TEXT NOT NULL,
        FOREIGN KEY (worker_id) REFERENCES workers(id)
    )
    """)

    # 5. Safety Events Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS safety_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        worker_id TEXT NOT NULL,
        scenario_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        details TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )
    """)

    # 6. Certificates Table (Updated with Supervisor Control)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS certificates (
        cert_id TEXT PRIMARY KEY,
        worker_id TEXT NOT NULL,
        worker_name TEXT NOT NULL,
        course_name TEXT NOT NULL,
        competency_score REAL NOT NULL,
        issue_date TEXT NOT NULL,
        cert_hash TEXT NOT NULL,
        verification_url TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ISSUED',
        issued_by_supervisor_id TEXT DEFAULT 'admin_supervisor'
    )
    """)

    # 7. Activities Master Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        question TEXT NOT NULL,
        options_json TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        explanation TEXT NOT NULL
    )
    """)

    # 8. Activity Attempts History Table (Never Overwrites!)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS activity_attempts (
        id TEXT PRIMARY KEY,
        trainee_id TEXT NOT NULL,
        activity_id TEXT NOT NULL,
        activity_title TEXT NOT NULL,
        activity_category TEXT NOT NULL,
        attempt_number INTEGER NOT NULL,
        question TEXT NOT NULL,
        options_json TEXT NOT NULL,
        selected_answer TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        is_correct INTEGER NOT NULL,
        score INTEGER NOT NULL,
        xp_delta INTEGER NOT NULL,
        time_taken_sec REAL NOT NULL,
        timestamp TEXT NOT NULL,
        explanation TEXT NOT NULL,
        mistakes_json TEXT NOT NULL,
        improvement_notes TEXT,
        FOREIGN KEY (trainee_id) REFERENCES workers(id)
    )
    """)

    # 9. Game Attempts History Table (Hazard Hunt Runs)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS game_attempts (
        id TEXT PRIMARY KEY,
        trainee_id TEXT NOT NULL,
        game_id TEXT NOT NULL,
        attempt_number INTEGER NOT NULL,
        score_pct INTEGER NOT NULL,
        time_taken_sec INTEGER NOT NULL,
        hazards_found INTEGER NOT NULL,
        total_hazards INTEGER NOT NULL,
        mistakes_count INTEGER NOT NULL,
        xp_earned INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (trainee_id) REFERENCES workers(id)
    )
    """)

    # 10. Daily Progress Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS daily_progress (
        id TEXT PRIMARY KEY,
        trainee_id TEXT NOT NULL,
        day_name TEXT NOT NULL,
        date TEXT NOT NULL,
        lessons_completed INTEGER NOT NULL,
        activities_completed INTEGER NOT NULL,
        games_completed INTEGER NOT NULL,
        ar_scenarios_completed INTEGER NOT NULL,
        training_time_min INTEGER NOT NULL,
        avg_accuracy REAL NOT NULL,
        xp_earned INTEGER NOT NULL,
        xp_lost INTEGER NOT NULL,
        competency_score REAL NOT NULL,
        overall_progress INTEGER NOT NULL,
        FOREIGN KEY (trainee_id) REFERENCES workers(id)
    )
    """)

    # 11. Audit Logs Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        actor_id TEXT NOT NULL,
        actor_role TEXT NOT NULL,
        action TEXT NOT NULL,
        target_id TEXT,
        details TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )
    """)

    conn.commit()
    seed_all_data(conn)
    conn.close()

def seed_all_data(conn):
    cur = conn.cursor()

    # 1. Seed Workers / Trainees
    cur.execute("SELECT COUNT(*) FROM workers")
    if cur.fetchone()[0] == 0:
        workers_data = [
            ("suresh_01", "Suresh", "Underground Belt Conveyor Operator", "Dhanbad Seam #4 (BCCL)", 1, "Mining Trainee", 120, 28, 78.5, "assets/images/worker_avatar.svg", 4, 2, "en", 1, 1),
            ("rajesh_02", "Rajesh Kumar", "Senior Continuous Miner Operator", "Jharia Deep Seam #9", 3, "Safety Specialist", 720, 85, 92.4, "assets/images/worker_avatar.svg", 12, 0, "hi", 1, 1),
            ("amit_03", "Amit Singh", "Haulage & Trimming Attendant", "Bokaro Open-to-Underground Link", 1, "Mining Trainee", 90, 22, 58.2, "assets/images/worker_avatar.svg", 1, 3, "en", 1, 1),
            ("sunita_04", "Sunita Hansda", "Ventilation Safety Officer", "Dhanbad North Seam", 2, "Miner Grade II", 380, 60, 74.0, "assets/images/worker_avatar.svg", 7, 1, "sat", 1, 1),
            ("manoj_05", "Manoj Murmu", "Mine Rescue Brigade Captain", "Jharia Coalfield Rescue Unit", 4, "Mine Rescue Master", 1450, 100, 96.8, "assets/images/worker_avatar.svg", 28, 0, "sat", 1, 1),
        ]
        cur.executemany("""
        INSERT INTO workers (id, name, role, mine_location, level, level_title, xp, progress_pct, competency_score, avatar_url, streaks, notifications_count, language, voice_guidance, sound_fx)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, workers_data)

    # 2. Seed Scenarios
    cur.execute("SELECT COUNT(*) FROM scenarios")
    if cur.fetchone()[0] == 0:
        scenarios_data = [
            (
                "fire_conveyor_01",
                "Fire & Explosion Response",
                "Lessons",
                "Conveyor Belt Friction & Coal Dust Spontaneous Heating",
                "Underground Seam 4 Trunk Conveyor Gallery, Dhanbad",
                "Medium",
                "Detect spontaneous coal combustion and smoldering belt friction. Select appropriate extinguisher and execute the PASS protocol from upwind intake ventilation.",
                60,
                "dcp_extinguisher",
                "intake",
                json.dumps(["pull", "aim", "squeeze", "sweep"])
            ),
            (
                "hazard_hunt_01",
                "Hazard Hunt: Conveyor Gallery",
                "Games",
                "Multi-Hazard Identification",
                "Main Haulage Road & Conveyor Junction",
                "Hard",
                "Spot critical hazards within time limit.",
                45,
                "dcp_extinguisher",
                "intake",
                json.dumps(["spot_idler", "spot_dust", "spot_curtain"])
            )
        ]
        cur.executemany("""
        INSERT INTO scenarios (id, title, category, hazard_type, location, difficulty, description, time_limit_sec, correct_equipment, correct_approach, pass_steps_required)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, scenarios_data)

    # 3. Seed Activities Master Table
    cur.execute("SELECT COUNT(*) FROM activities")
    if cur.fetchone()[0] == 0:
        activities_data = [
            (
                "act_fire_extinguisher",
                "Fire Extinguisher Selection",
                "Fire Safety",
                "Select certified firefighting agent for underground conveyor drive motor and coal accumulation.",
                "Which fire extinguishing media must be selected for an electrical conveyor belt drive fire in an underground seam?",
                json.dumps(["Water Extinguisher / Spray", "Dry Chemical Powder (DCP - IS 2171)", "Foam Extinguisher", "Carbon Dioxide in Return Airway"]),
                "Dry Chemical Powder (DCP - IS 2171)",
                "Dry Chemical Powder non-conductively interrupts the chemical chain reaction and smothers coal dust without causing an electrical conduction hazard or dust cloud explosion."
            ),
            (
                "act_ventilation_airway",
                "Ventilation Airway Positioning",
                "Ventilation",
                "Identify statutory upwind positioning during fire and smoke suppression.",
                "When approaching a smoldering conveyor friction fire, which airway position provides safety from toxic Carbon Monoxide (CO)?",
                json.dumps(["Return Airway (Downwind)", "Intake Airway (Upwind)", "Directly Underneath Belt Drive", "Neutral Airway"]),
                "Intake Airway (Upwind)",
                "Intake Airway supplies fresh atmospheric air traveling past the firefighter toward the fire, carrying heat, dense smoke, and toxic carbon monoxide away from the trainee."
            ),
            (
                "act_methane_threshold",
                "Methane Threshold Action",
                "Gas Monitoring",
                "Statutory DGMS response when inflammable gas reaches critical limits.",
                "Under DGMS Coal Mines Regulation 169, what mandatory action is required if inflammable gas reaches 1.25% in the working face?",
                json.dumps(["Continue work but turn on water mist", "Open compressed air valve to dilute gas", "Cut electric power and immediately withdraw team to intake air", "Ignore until gas reaches 5%"]),
                "Cut electric power and immediately withdraw team to intake air",
                "At 1.25% methane (CH4), electrical power supply must be isolated immediately and all personnel withdrawn to fresh air until competent sirdar certifies safety."
            ),
            (
                "act_ppe_compliance",
                "Pre-Shift PPE Compliance Inspection",
                "Personal Protection",
                "Statutory DGMS pre-shift safety verification before shaft descent.",
                "Which item is statutory mandated for continuous emergency oxygen supply during underground mine fire evacuation?",
                json.dumps(["N95 Cotton Dust Mask", "Wet Handkerchief", "Self-Contained Self-Rescuer (SCSR 60-min)", "Welding Face Shield"]),
                "Self-Contained Self-Rescuer (SCSR 60-min)",
                "SCSR chemically generates breathable oxygen for up to 60 minutes, shielding lungs against lethal Carbon Monoxide (CO) and oxygen deficiency."
            ),
            (
                "act_pass_protocol",
                "PASS Protocol Execution Order",
                "Fire Safety",
                "Standard operating procedure for manual extinguisher operation.",
                "What is the correct sequential order of the PASS technique?",
                json.dumps(["Pull, Aim, Squeeze, Sweep", "Aim, Pull, Squeeze, Sweep", "Squeeze, Aim, Pull, Sweep", "Sweep, Squeeze, Aim, Pull"]),
                "Pull, Aim, Squeeze, Sweep",
                "PASS sequence: [P] Pull the lock pin -> [A] Aim at fuel base -> [S] Squeeze the operating lever -> [S] Sweep side-to-side across burning fuel."
            )
        ]
        cur.executemany("""
        INSERT INTO activities (id, title, category, description, question, options_json, correct_answer, explanation)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, activities_data)

    # 4. Seed Activity Attempts History (Never Overwrites! Shows Attempt 1 vs Attempt 2 with improvement)
    cur.execute("SELECT COUNT(*) FROM activity_attempts")
    if cur.fetchone()[0] == 0:
        activity_attempts_data = [
            (
                "att_act_001",
                "suresh_01",
                "act_fire_extinguisher",
                "Fire Extinguisher Selection",
                "Fire Safety",
                1,
                "Which fire extinguishing media must be selected for an electrical conveyor belt drive fire in an underground seam?",
                json.dumps(["Water Extinguisher / Spray", "Dry Chemical Powder (DCP - IS 2171)", "Foam Extinguisher", "Carbon Dioxide in Return Airway"]),
                "Water Extinguisher / Spray",
                "Dry Chemical Powder (DCP - IS 2171)",
                0,
                0,
                -10,
                8.2,
                "2026-09-11T09:14:00Z",
                "Dry Chemical Powder non-conductively interrupts the chemical chain reaction and smothers coal dust without causing an electrical conduction hazard.",
                json.dumps(["Selected water on electrical equipment", "Water jet can cause coal dust dispersion explosion"]),
                "Failed to recognize electrical conductivity risk. Review Module 2."
            ),
            (
                "att_act_002",
                "suresh_01",
                "act_fire_extinguisher",
                "Fire Extinguisher Selection",
                "Fire Safety",
                2,
                "Which fire extinguishing media must be selected for an electrical conveyor belt drive fire in an underground seam?",
                json.dumps(["Water Extinguisher / Spray", "Dry Chemical Powder (DCP - IS 2171)", "Foam Extinguisher", "Carbon Dioxide in Return Airway"]),
                "Dry Chemical Powder (DCP - IS 2171)",
                "Dry Chemical Powder (DCP - IS 2171)",
                1,
                100,
                15,
                5.4,
                "2026-09-12T14:30:00Z",
                "Dry Chemical Powder non-conductively interrupts the chemical chain reaction and smothers coal dust without causing an electrical conduction hazard.",
                json.dumps([]),
                "Outstanding improvement! Response time improved by 2.8s and correct extinguishing agent identified."
            ),
            (
                "att_act_003",
                "suresh_01",
                "act_ventilation_airway",
                "Ventilation Airway Positioning",
                "Ventilation",
                1,
                "When approaching a smoldering conveyor friction fire, which airway position provides safety from toxic Carbon Monoxide (CO)?",
                json.dumps(["Return Airway (Downwind)", "Intake Airway (Upwind)", "Directly Underneath Belt Drive", "Neutral Airway"]),
                "Intake Airway (Upwind)",
                "Intake Airway (Upwind)",
                1,
                100,
                15,
                4.1,
                "2026-09-12T15:10:00Z",
                "Intake Airway supplies fresh atmospheric air traveling past the firefighter toward the fire, carrying heat, dense smoke, and toxic carbon monoxide away.",
                json.dumps([]),
                "Excellent tactical awareness. Trainee understood upwind airway airflow on first attempt."
            ),
            (
                "att_act_004",
                "amit_03",
                "act_ventilation_airway",
                "Ventilation Airway Positioning",
                "Ventilation",
                1,
                "When approaching a smoldering conveyor friction fire, which airway position provides safety from toxic Carbon Monoxide (CO)?",
                json.dumps(["Return Airway (Downwind)", "Intake Airway (Upwind)", "Directly Underneath Belt Drive", "Neutral Airway"]),
                "Return Airway (Downwind)",
                "Intake Airway (Upwind)",
                0,
                0,
                -20,
                9.8,
                "2026-09-12T10:15:00Z",
                "Intake Airway supplies fresh atmospheric air traveling past the firefighter toward the fire.",
                json.dumps(["Downwind return airway approach", "Severe toxic smoke inhalation risk"]),
                "Critical safety violation! Mandatory retraining assigned."
            )
        ]
        cur.executemany("""
        INSERT INTO activity_attempts (id, trainee_id, activity_id, activity_title, activity_category, attempt_number, question, options_json, selected_answer, correct_answer, is_correct, score, xp_delta, time_taken_sec, timestamp, explanation, mistakes_json, improvement_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, activity_attempts_data)

    # 5. Seed Game Attempts History (Hazard Hunt Runs)
    cur.execute("SELECT COUNT(*) FROM game_attempts")
    if cur.fetchone()[0] == 0:
        game_attempts_data = [
            ("att_game_001", "suresh_01", "hazard_hunt_01", 1, 62, 48, 4, 7, 3, 40, "2026-09-10T11:20:00Z"),
            ("att_game_002", "suresh_01", "hazard_hunt_01", 2, 81, 35, 6, 7, 1, 75, "2026-09-11T16:45:00Z"),
            ("att_game_003", "suresh_01", "hazard_hunt_01", 3, 94, 27, 7, 7, 0, 100, "2026-09-12T17:15:00Z"),
            ("att_game_004", "amit_03", "hazard_hunt_01", 1, 45, 52, 3, 7, 4, 25, "2026-09-12T09:30:00Z"),
        ]
        cur.executemany("""
        INSERT INTO game_attempts (id, trainee_id, game_id, attempt_number, score_pct, time_taken_sec, hazards_found, total_hazards, mistakes_count, xp_earned, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, game_attempts_data)

    # 6. Seed Daily Progress (Monday to Sunday)
    cur.execute("SELECT COUNT(*) FROM daily_progress")
    if cur.fetchone()[0] == 0:
        daily_progress_data = [
            ("dp_01", "suresh_01", "Mon", "2026-09-08", 1, 2, 1, 0, 25, 75.0, 55, 10, 72.0, 15),
            ("dp_02", "suresh_01", "Tue", "2026-09-09", 2, 1, 1, 1, 38, 80.0, 70, 0, 74.5, 20),
            ("dp_03", "suresh_01", "Wed", "2026-09-10", 1, 3, 2, 1, 45, 82.5, 90, 10, 76.0, 22),
            ("dp_04", "suresh_01", "Thu", "2026-09-11", 2, 2, 1, 1, 40, 85.0, 85, 0, 77.2, 25),
            ("dp_05", "suresh_01", "Fri", "2026-09-12", 2, 4, 2, 2, 52, 88.0, 125, 0, 78.5, 28),
        ]
        cur.executemany("""
        INSERT INTO daily_progress (id, trainee_id, day_name, date, lessons_completed, activities_completed, games_completed, ar_scenarios_completed, training_time_min, avg_accuracy, xp_earned, xp_lost, competency_score, overall_progress)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, daily_progress_data)

    # 7. Seed Certificates (Suresh is ELIGIBLE, Manoj is ISSUED)
    cur.execute("SELECT COUNT(*) FROM certificates")
    if cur.fetchone()[0] == 0:
        certs_data = [
            (
                "CERT-DGMS-2026-8941",
                "manoj_05",
                "Manoj Murmu",
                "DGMS Underground Mine Fire Safety & PASS Extinguisher Standard",
                96.8,
                "2026-09-01",
                "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "/#certificate/CERT-DGMS-2026-8941",
                "ISSUED",
                "supervisor_admin"
            ),
            (
                "CERT-DGMS-2026-PENDING-01",
                "suresh_01",
                "Suresh",
                "DGMS Underground Mine Fire Safety & PASS Extinguisher Standard",
                78.5,
                "",
                "",
                "/#certificate/CERT-DGMS-2026-PENDING-01",
                "ELIGIBLE",
                ""
            )
        ]
        cur.executemany("""
        INSERT INTO certificates (cert_id, worker_id, worker_name, course_name, competency_score, issue_date, cert_hash, verification_url, status, issued_by_supervisor_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, certs_data)

    # 8. Seed Audit Logs
    cur.execute("SELECT COUNT(*) FROM audit_logs")
    if cur.fetchone()[0] == 0:
        audit_data = [
            ("log_01", "supervisor_admin", "supervisor", "LOGIN", "system", "Supervisor session initiated from DGMS Safety Console", "2026-09-12T08:00:00Z"),
            ("log_02", "supervisor_admin", "supervisor", "CERTIFICATE_ISSUED", "manoj_05", "Issued DGMS Certificate CERT-DGMS-2026-8941 to Manoj Murmu (Score: 96.8%)", "2026-09-01T16:00:00Z"),
            ("log_03", "system", "system", "RETRAINING_RECOMMENDED", "amit_03", "Automatic retraining triggered for Amit Singh due to downwind airway violation", "2026-09-12T10:16:00Z")
        ]
        cur.executemany("""
        INSERT INTO audit_logs (id, actor_id, actor_role, action, target_id, details, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, audit_data)

    conn.commit()
