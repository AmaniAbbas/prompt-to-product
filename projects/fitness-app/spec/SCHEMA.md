# Database Schema

## organizations

* id (uuid, pk)
* name
* created_at

---

## users

* id (uuid, pk)
* org_id (fk)
* role (coach | client | admin)
* email
* created_at

---

## coach_profiles

* id (uuid)
* user_id (fk)
* display_name
* business_name
* default_payment_link_url
* trial_started_at
* trial_ends_at
* subscription_status
* created_at

---

## client_profiles

* id (uuid)
* user_id (fk)
* coach_id (fk)
* display_name
* email
* consented_health_data (boolean)
* consented_progress_photos (boolean)
* created_at

---

## exercises

* id (uuid)
* org_id
* created_by
* name
* description
* video_url
* is_global (boolean)
* created_at

---

## workout_templates

* id
* org_id
* coach_id
* name
* description
* created_at
* updated_at

---

## workout_template_exercises

* id
* template_id
* exercise_id
* position
* sets
* reps
* weight
* rest
* rpe
* tempo
* notes

---

## assigned_workouts

* id
* org_id
* coach_id
* client_id
* source_template_id
* label
* assigned_date
* title
* notes
* created_at

---

## assigned_workout_exercises

* id
* assigned_workout_id
* exercise_name
* exercise_description
* video_url
* position
* sets
* reps
* weight
* rest
* rpe
* tempo
* notes
* completed_at

---

## check_ins

* id
* org_id
* coach_id
* client_id
* weight
* mood (1–5)
* adherence (0–100)
* comments
* created_at

---

## progress_photos

* id
* check_in_id
* client_id
* coach_id
* storage_path
* created_at

---

## comments

* id
* org_id
* author_id
* coach_id
* client_id
* context_type (exercise | workout | checkin)
* context_id
* body
* created_at

---

## notification_settings

* id
* coach_id
* invite_emails
* plan_assigned_emails
* checkin_reminder_emails
* comment_emails
* payment_reminder_emails

---

## client_payment_links

* id
* coach_id
* client_id
* payment_link_url
* created_at
* updated_at

---

## Notes

* All tables must enforce RLS
* Index:

  * coach_id
  * client_id
  * org_id
* Use UUIDs everywhere
* Use text for flexible workout fields
