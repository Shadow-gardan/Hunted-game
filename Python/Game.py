git push -u origin check"""A small, asset-free horror game made with Pygame.

Controls:
    W / A / S / D or arrow keys - move
    F                       - toggle the flashlight
    R                       - restart after winning or losing
    Escape                  - quit

Goal:
    Survive until the timer reaches zero without letting the ghost touch you.
"""

import math
import random
import sys
import pygame

# Window and gameplay settings.
WIDTH, HEIGHT = 900, 600
FPS = 60
SURVIVAL_TIME = 45
PLAYER_SPEED = 240
GHOST_SPEED = 95

# Colors are kept here so they are easy to change.
BLACK = (5, 5, 10)
DARK_WALL = (32, 35, 48)
FLOOR = (18, 20, 28)
WHITE = (235, 235, 235)
RED = (190, 35, 45)
GREEN = (70, 210, 120)
YELLOW = (245, 220, 100)


def draw_text(surface, text, size, color, position, center=False):
    """Draw readable text using Pygame's default font."""
    font = pygame.font.Font(None, size)
    image = font.render(text, True, color)
    rectangle = image.get_rect()
    if center:
        rectangle.center = position
    else:
        rectangle.topleft = position
    surface.blit(image, rectangle)


def create_maze():
    """Create simple rectangular walls without needing an external map file."""
    return [
        pygame.Rect(0, 0, WIDTH, 20),
        pygame.Rect(0, HEIGHT - 20, WIDTH, 20),
        pygame.Rect(0, 0, 20, HEIGHT),
        pygame.Rect(WIDTH - 20, 0, 20, HEIGHT),
        pygame.Rect(180, 80, 30, 280),
        pygame.Rect(350, 240, 230, 30),
        pygame.Rect(650, 80, 30, 260),
        pygame.Rect(250, 470, 300, 30),
    ]


def move_player(player, movement, walls):
    """Move one axis at a time so the player cannot walk through walls."""
    player.x += int(movement.x)
    for wall in walls:
        if player.colliderect(wall):
            if movement.x > 0:
                player.right = wall.left
            elif movement.x < 0:
                player.left = wall.right

    player.y += int(movement.y)
    for wall in walls:
        if player.colliderect(wall):
            if movement.y > 0:
                player.bottom = wall.top
            elif movement.y < 0:
                player.top = wall.bottom


def reset_game():
    """Return all game objects to their starting positions."""
    player = pygame.Rect(70, HEIGHT - 90, 24, 24)
    ghost = pygame.Rect(WIDTH - 90, 70, 28, 28)
    return player, ghost, pygame.time.get_ticks(), True, True


def draw_darkness(screen, player, flashlight_on):
    """Cover the room in darkness and cut out a circular flashlight beam."""
    darkness = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
    darkness.fill((0, 0, 0, 220 if flashlight_on else 245))

    # A transparent circle makes the area around the player visible.
    radius = 185 if flashlight_on else 65
    pygame.draw.circle(darkness, (0, 0, 0, 0), player.center, radius)
    screen.blit(darkness, (0, 0))


def main():
    """Run the game loop."""
    pygame.init()
    pygame.display.set_caption("The Room That Watches")
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    clock = pygame.time.Clock()
    walls = create_maze()

    player, ghost, start_time, flashlight_on, playing = reset_game()
    won = False
    random.seed()

    while True:
        delta_time = clock.tick(FPS) / 1000
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    pygame.quit()
                    sys.exit()
                if event.key == pygame.K_f and playing:
                    flashlight_on = not flashlight_on
                if event.key == pygame.K_r and not playing:
                    player, ghost, start_time, flashlight_on, playing = reset_game()
                    won = False

        if playing:
            keys = pygame.key.get_pressed()
            movement = pygame.Vector2(
                keys[pygame.K_d] - keys[pygame.K_a],
                keys[pygame.K_s] - keys[pygame.K_w],
            )
            if keys[pygame.K_RIGHT]:
                movement.x += 1
            if keys[pygame.K_LEFT]:
                movement.x -= 1
            if keys[pygame.K_DOWN]:
                movement.y += 1
            if keys[pygame.K_UP]:
                movement.y -= 1
            if movement.length_squared() > 0:
                movement = movement.normalize() * PLAYER_SPEED * delta_time
                move_player(player, movement, walls)

            # The ghost always moves toward the player, creating pressure.
            direction = pygame.Vector2(player.center) - pygame.Vector2(ghost.center)
            if direction.length_squared() > 0:
                direction = direction.normalize()
                ghost.x += round(direction.x * GHOST_SPEED * delta_time)
                ghost.y += round(direction.y * GHOST_SPEED * delta_time)

            if player.colliderect(ghost):
                playing = False
                won = False

            elapsed = (pygame.time.get_ticks() - start_time) / 1000
            if elapsed >= SURVIVAL_TIME:
                playing = False
                won = True

        # Draw the room.
        screen.fill(FLOOR)
        for wall in walls:
            pygame.draw.rect(screen, DARK_WALL, wall)
            pygame.draw.rect(screen, (55, 58, 75), wall, 2)

        # The ghost is deliberately simple and unsettling: red eyes in darkness.
        pygame.draw.ellipse(screen, (80, 80, 90), ghost)
        pygame.draw.circle(screen, RED, (ghost.x + 8, ghost.y + 10), 3)
        pygame.draw.circle(screen, RED, (ghost.x + 20, ghost.y + 10), 3)
        pygame.draw.rect(screen, GREEN, player)

        draw_darkness(screen, player, flashlight_on)

        if playing:
            elapsed = (pygame.time.get_ticks() - start_time) / 1000
            remaining = max(0, math.ceil(SURVIVAL_TIME - elapsed))
            draw_text(screen, f"Survive: {remaining}s", 28, WHITE, (35, 30))
            draw_text(
                screen,
                f"Flashlight: {'ON' if flashlight_on else 'OFF'} (F)",
                24,
                YELLOW,
                (35, 58),
            )
        else:
            overlay = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
            overlay.fill((0, 0, 0, 150))
            screen.blit(overlay, (0, 0))
            if won:
                draw_text(screen, "YOU SURVIVED", 64, GREEN, (WIDTH // 2, HEIGHT // 2 - 35), True)
                draw_text(screen, "Press R to play again", 30, WHITE, (WIDTH // 2, HEIGHT // 2 + 25), True)
            else:
                draw_text(screen, "THE GHOST FOUND YOU", 58, RED, (WIDTH // 2, HEIGHT // 2 - 35), True)
                draw_text(screen, "Press R to try again", 30, WHITE, (WIDTH // 2, HEIGHT // 2 + 25), True)

        pygame.display.flip()


if __name__ == "__main__":
    main()