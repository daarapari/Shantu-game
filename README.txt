ESTAI - FINAL BIRTHDAY GAME BUILD

Open index.html in a modern browser or host this folder as a static website.

Included updates:
- Increased collectible spawn frequency while retaining obstacle spacing checks.
- Removed the 100-meter/meter-fill gift pause. Each full memory meter resets the current obstacle-hit marks and grants a brief invulnerability window.
- Dance and regulator collectibles play supplied image sequences. Animation timing does not depend on image-load success, preventing those scenes from leaving the game paused.
- Regulator collectible uses the supplied regulator image; dance collectible uses its own icon.
- Opening screen includes instructions and birthday greeting.
- Supplied sanchai.aac starts after the Start tap, with browser playback restrictions handled safely.
- End screen reports memories, animal friends, and distance, and includes Restart.

The existing gameplay structure and other memory interactions are retained. Some optional sound-effect filenames referenced by the pre-existing source are not included in the supplied asset bundle; missing optional sounds are caught by the existing playback handlers and do not block gameplay.

- Removed text-only collectible types from the spawn pool; retained image-backed and animated collectibles.
- Added a soft pulsing glow to all collectible types without changing collision or scoring logic.
