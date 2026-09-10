# Code Explanation: The Room That Watches

This document explains the complete `Game.py` file.

## 1. Module description and imports

The opening docstring describes the game, its controls, and its goal.

```python
import math
import random
import sys
import pygame
```

- `math` provides `ceil()` for displaying the remaining whole seconds.
- `random` initializes Python's random number generator.
- `sys` provides `sys.exit()` when the game closes.
- `pygame` provides the game window, keyboard input, timing, drawing, fonts,
  vectors, surfaces, and rectangles.

## 2. Game settings

```python
WIDTH, HEIGHT = 900, 600
FPS = 60
SURVIVAL_TIME = 45
PLAYER_SPEED = 240
GHOST_SPEED = 95
```

These constants control the window size, target frame rate, time required to
win, and movement speeds. Keeping them in one place makes the game easy to
adjust.

The color constants store RGB values used when drawing the floor, walls,
player, ghost, text, and flashlight interface.

## 3. `draw_text()`

```python
def draw_text(surface, text, size, color, position, center=False):
```

This helper displays text:

1. It creates a Pygame font at the requested size.
2. It renders the supplied string into an image.
3. It positions the image either at its top-left corner or at its center.
4. It draws the image on the game surface.

It is used for the timer, flashlight status, and win/loss messages.

## 4. `create_maze()`

This function returns a list of `pygame.Rect` objects. Each rectangle is a
wall:

- Four rectangles form the outside boundary.
- The remaining rectangles form obstacles inside the room.

Using rectangles keeps the collision code simple and means the game does not
need an external map or image file.

## 5. `move_player()`

```python
def move_player(player, movement, walls):
```

The player is moved one axis at a time:

1. The function moves the player horizontally.
2. It checks every wall for a collision.
3. If a collision occurs, it places the player directly beside that wall.
4. It repeats the same process vertically.

Separating the axes prevents the player from passing through walls and allows
the player to slide along a wall.

## 6. `reset_game()`

This function creates the starting rectangles for the player and ghost:

```python
player = pygame.Rect(70, HEIGHT - 90, 24, 24)
ghost = pygame.Rect(WIDTH - 90, 70, 28, 28)
```

It also records the current Pygame time and resets the flashlight and playing
state. Returning all reset values from one function allows the same logic to be
used when the game starts and when the player presses `R`.

## 7. `draw_darkness()`

This function creates the flashlight effect:

1. It creates a transparent surface the same size as the screen.
2. It fills that surface with mostly opaque black.
3. It draws a fully transparent circle around the player.
4. It places the darkness surface over the game.

When the flashlight is on, the circle has a radius of `185` pixels. When it is
off, the radius is only `65` pixels. The player and nearby objects therefore
remain visible while the rest of the room is dark.

## 8. `main()`: Pygame setup

The `main()` function starts the game:

```python
pygame.init()
pygame.display.set_caption("The Room That Watches")
screen = pygame.display.set_mode((WIDTH, HEIGHT))
clock = pygame.time.Clock()
walls = create_maze()
```

- `pygame.init()` initializes Pygame modules.
- `set_caption()` sets the window title.
- `set_mode()` creates the game window.
- `Clock()` controls the frame rate.
- `create_maze()` creates the collision walls.

The game state is then initialized with `reset_game()`.

## 9. The main game loop

```python
while True:
```

The loop runs until the player quits. At the start of each frame:

```python
delta_time = clock.tick(FPS) / 1000
```

`clock.tick(FPS)` limits the game to approximately 60 frames per second and
returns the time since the previous frame in milliseconds. Dividing by `1000`
converts it to seconds. Movement is multiplied by this value so it is
consistent on computers with different performance.

## 10. Event handling

The event loop handles window and keyboard events:

- Closing the window exits Pygame and the program.
- `Escape` quits.
- `F` toggles the flashlight while the game is active.
- `R` resets the game after a win or loss.

The restart code calls `reset_game()` and clears the `won` flag.

## 11. Player movement

While `playing` is true, the code reads the keyboard:

```python
movement = pygame.Vector2(
    keys[pygame.K_d] - keys[pygame.K_a],
    keys[pygame.K_s] - keys[pygame.K_w],
)
```

This creates a vector from the `W`, `A`, `S`, and `D` keys. Arrow-key input is
then added to the same vector.

If the vector is not zero, it is normalized and multiplied by the player
speed and frame time. Normalization prevents diagonal movement from being
faster than horizontal or vertical movement. `move_player()` applies the
movement while respecting the walls.

## 12. Ghost movement

The ghost follows the player:

```python
direction = pygame.Vector2(player.center) - pygame.Vector2(ghost.center)
```

This subtracts the ghost position from the player position, producing a vector
pointing toward the player. The vector is normalized and multiplied by the
ghost speed and frame time. The ghost's rectangle is then updated.

The ghost does not currently use wall collision, so it can move directly
toward the player through obstacles.

## 13. Win and loss conditions

The player loses when the rectangles overlap:

```python
if player.colliderect(ghost):
    playing = False
    won = False
```

The player wins when the elapsed time reaches `SURVIVAL_TIME`:

```python
if elapsed >= SURVIVAL_TIME:
    playing = False
    won = True
```

Setting `playing` to `False` stops movement and changes the screen to the
end-game display.

## 14. Drawing the room

Each frame starts by filling the screen with the floor color. Every wall is
drawn twice:

1. A filled rectangle draws the wall.
2. A two-pixel outline makes the wall easier to see.

The ghost is drawn as a gray ellipse with two red eyes. The player is drawn as
a green rectangle. These simple shapes make the game asset-free.

The darkness overlay is drawn after the player and ghost, creating the
flashlight effect.

## 15. HUD and end-game screen

While the game is active, the code displays:

- The number of seconds remaining.
- Whether the flashlight is on or off.

After the game ends, a semi-transparent black overlay dims the room. The
message depends on the `won` flag:

- `YOU SURVIVED` appears after the timer reaches zero.
- `THE GHOST FOUND YOU` appears after the ghost touches the player.

Both screens tell the player to press `R` to play again.

## 16. Updating the display

```python
pygame.display.flip()
```

This presents everything drawn during the current frame on the window. It must
be called every loop iteration for the display to update.

## 17. Program entry point

```python
if __name__ == "__main__":
    main()
```

This runs `main()` only when `Game.py` is executed directly. It prevents the
game from starting automatically if the file is imported by another Python
module.

## 18. Possible improvements

- Add collision handling for the ghost so it cannot pass through walls.
- Add sound effects and background music.
- Add multiple maze layouts.
- Add a limited flashlight battery.
- Move the player, ghost, and maze into classes as the game grows.
- Replace the simple shapes with images or animations.
