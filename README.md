# 🧟Game-ZombieWave
A strategic, grid-based survival game built from scratch using HTML5 Canvas, CSS3, and Vanilla JavaScript. Defend your territory against relentless waves of zombies by deploying specialized units and managing your gold resources in real-time.

## 🎮 Gameplay Features
-Dynamic Unit Deployment: Drag and drop different unit types onto the grid to build your defense line.
-Resource Management: Collect gold by hovering over falling coins to fund your army.
-Status Effects: Utilize advanced combat mechanics including Freezing (Ice) to slow enemies and Burning (Fire) for damage-over-time.
-Scaling Difficulty: Survive against various enemy types like Standard zombies, high-health Brutes, and the formidable Titans.
-Real-time UI: Integrated survival timer, score tracking, and resource counters.

## 📂 File Structure
#### As seen in your project directory:

1. Zombie Wave (HTML): Defines the game container, UI side-bar for units, and the Canvas element.
2. script.js: The main logic file containing game classes (Defender, Enemy, Bonus, Particle), collision math, and the animation loop.
3. style.css: Manages the layout, unit card visuals, and the dark-themed game overlays.
4. Game BGM.mp3: The looping background score for atmosphere.
5. Collect Item Sound Effect.mp3: Feedback audio for gold collection.

## 🛠️ Technical Implementation
Core Systems
-Game Engine: Built on a custom requestAnimationFrame loop for smooth 60 FPS rendering.
-Collision Engine: Implements circle-to-rectangle and proximity-based detection for projectiles and resource collection.
-Particle Engine: Custom Particle class handles visual feedback for unit-specific effects (e.g., fire embers and ice crystals).
-Unit AI: Defenders detect enemies in their specific row and trigger attack cycles automatically.
<html>
<table style="width:100%; border-collapse: collapse; font-family: sans-serif; background-color: #2c3e50; color: white; border: 1px solid #34495e;">
    <thead>
        <tr style="background-color: #34495e; text-align: left;">
            <th style="padding: 12px; border: 1px solid #555;">Unit Type</th>
            <th style="padding: 12px; border: 1px solid #555;">Cost</th>
            <th style="padding: 12px; border: 1px solid #555;">HP</th>
            <th style="padding: 12px; border: 1px solid #555;">Special Ability</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="padding: 12px; border: 1px solid #555; color: #9b59b6; font-weight: bold;">Standard</td>
            <td style="padding: 12px; border: 1px solid #555;">$100</td>
            <td style="padding: 12px; border: 1px solid #555;">100</td>
            <td style="padding: 12px; border: 1px solid #555;">Balanced fire rate and damage.</td>
        </tr>
        <tr style="background-color: rgba(255,255,255,0.05);">
            <td style="padding: 12px; border: 1px solid #555; color: #e67e22; font-weight: bold;">Fire</td>
            <td style="padding: 12px; border: 1px solid #555;">$150</td>
            <td style="padding: 12px; border: 1px solid #555;">80</td>
            <td style="padding: 12px; border: 1px solid #555;">High damage; inflicts <b>Burn</b> (DOT).</td>
        </tr>
        <tr>
            <td style="padding: 12px; border: 1px solid #555; color: #3498db; font-weight: bold;">Ice</td>
            <td style="padding: 12px; border: 1px solid #555;">$200</td>
            <td style="padding: 12px; border: 1px solid #555;">160</td>
            <td style="padding: 12px; border: 1px solid #555;">Slows enemy movement by 60%.</td>
        </tr>
        <tr style="background-color: rgba(255,255,255,0.05);">
            <td style="padding: 12px; border: 1px solid #555; color: #7f8c8d; font-weight: bold;">Shield</td>
            <td style="padding: 12px; border: 1px solid #555;">$50</td>
            <td style="padding: 12px; border: 1px solid #555;">600</td>
            <td style="padding: 12px; border: 1px solid #555;">High-durability wall (No attack).</td>
        </tr>
        <tr>
            <td style="padding: 12px; border: 1px solid #555; color: #ffffff; font-weight: bold;">Remover</td>
            <td style="padding: 12px; border: 1px solid #555;">$0</td>
            <td style="padding: 12px; border: 1px solid #555;">-</td>
            <td style="padding: 12px; border: 1px solid #555;">Safely removes units from the grid.</td>
        </tr>
    </tbody>
</table>
</html>

## 🚀 How to Run
1. Download or clone the repository.
2. Ensure all files (HTML, JS, CSS, and MP3) are located in the same root directory.
3. Open the Zombie Wave HTML file in any modern web browser (Chrome/Microsoft Edge and etc).

