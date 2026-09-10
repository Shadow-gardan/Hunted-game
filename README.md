# The Room That Watches

An asset-free 2D horror survival game built with Python and Pygame. Move around
the room, use the flashlight to see, and survive for 45 seconds without being
caught by the ghost.

## Requirements

- Python 3
- Pygame

Install Pygame on Linux:

```bash
python3 -m pip install pygame
```

If the regular Pygame package is unavailable in your environment, install the
community edition instead:

```bash
python3 -m pip install pygame-ce
```

`pygame-ce` uses the same `import pygame` statement, so no code changes are
needed.

## Run the game

From this directory, run:

```bash
python3 Game.py
```

## Controls

| Key | Action |
| --- | --- |
| `W`, `A`, `S`, `D` | Move |
| Arrow keys | Move |
| `F` | Toggle the flashlight |
| `R` | Restart after winning or losing |
| `Escape` | Quit |

## How to play

The green rectangle is the player and the gray figure is the ghost. The ghost
continuously moves toward the player. Avoid it until the 45-second timer
reaches zero. The flashlight increases the visible area around the player.

## Project files

```text
.
├── Game.py
├── README.md
└── CODE_EXPLANATION.md
```

- `Game.py` contains the complete game.
- `CODE_EXPLANATION.md` explains the code section by section.

## Technical overview

- Pygame handles the window, input, timing, drawing, fonts, and collision
  rectangles.
- The maze is made from rectangular walls, so no external assets are required.
- Player movement uses separate horizontal and vertical collision checks.
- The ghost follows the player using a normalized direction vector.
- A transparent overlay creates the darkness and flashlight effect.
