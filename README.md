# Car Accident Memory Experiment

A static, browser-based psychology experiment modeled on the structure of the Encoding Strategies assignment, adapted for a post-event misinformation / post-identification feedback study.

## Design

A 2 × 2 between-participants design:

| Factor | Condition A | Condition B |
|---|---|---|
| Question wording | Misleading: asks about the yield sign | Accurate: asks about the stop sign |
| Post-identification feedback | Confirming: “Correct!” | Neutral: “Okay.” |

Each factor is independently randomized when a participant begins a session. The original video always depicts the STOP sign. The two recognition images show the same intersection with either the STOP sign or a YIELD sign; their left/right positions are randomized.

## Participant flow

1. Consent and brief instructions.
2. Watch the continuous STOP-sign animation.
3. Answer the randomly assigned speed-estimate question.
4. Select which of two images matches the original scene.
5. Receive randomly assigned “Correct!” or “Okay.” feedback.
6. Rate confidence from 1–10.
7. View a debrief and download the data.

## Measures and scoring

- `accuracy`: 1 if the STOP image was selected; 0 if the YIELD image was selected.
- `confidence_1_to_10`: confidence slider response.
- `speed_estimate_mph`: participant's speed estimate.
- `question_condition`: `misleading` or `accurate`.
- `feedback_condition`: `confirming` or `neutral`.
- Response times for the speed estimate and recognition choice.
- Random session ID, option order, and UTC completion timestamp.

## Files

- `index.html`: participant-facing screens.
- `styles.css`: responsive visual design.
- `script.js`: random assignment, task flow, scoring, browser storage, CSV downloads.
- `assets/stop-scene.mp4`: continuous video made from the STOP-only portion of your uploaded GIF (or `stop-scene.gif` fallback if MP4 encoding was unavailable).
- `assets/choice-stop.jpg` and `assets/choice-yield.jpg`: recognition options.
- `assets/original-uploaded-animation.gif`: untouched source animation for reference.

## Test locally

1. Unzip the project.
2. Open `index.html` in Chrome, Firefox, or Safari.
3. For reliable video loading, start a local server from this folder:
   - `python -m http.server 8000`
   - Open `http://localhost:8000`
4. Complete a full session and test both CSV download buttons.
5. Refresh and complete another session to confirm that random assignments and option positions can change.

## Publish with GitHub Pages

1. Create a new GitHub repository.
2. Upload the contents of this folder (not the ZIP itself).
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then save.
6. Wait for the public Pages URL, open it, and complete a test session.

## Data collection limitations

This is a static site: it has no server or database and does not send data to GitHub. Completed sessions are saved in the participant's browser `localStorage`. Each participant can download their own summary and trial-level CSV. The “all sessions” CSV contains sessions completed in the same browser on the same device only. For a class project, collect each participant's downloaded CSV and combine them afterward.

## Research notes

- The source GIF contains 16 frames: frames 0–7 show the STOP sign and frames 8–15 show the YIELD sign. The experiment video uses only frames 0–7, repeated as a continuous encoded video. The YIELD sign is not shown during the initial event.
- The confirming feedback is randomized independently of whether the participant actually chose the correct image. This is part of the manipulation.
- Obtain instructor / ethics approval and use the consent/debrief process required by your course before collecting research data.
- This is a practice implementation; test the full participant flow and data exports before using it for a graded submission or data collection.
