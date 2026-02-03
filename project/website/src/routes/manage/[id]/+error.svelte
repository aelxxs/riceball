<script lang="ts">
import { page } from "$app/state";
</script>

<div class="container">
  <div class="icon-wrapper">
    <img class="icon" src="/riceball-sad.svg" alt="riceball-icon" />
    <div class="icon-glow"></div>
  </div>

  <div class="status-wrapper">
    <span class="status">{page.status}</span>
    <div class="status-line"></div>
  </div>

  <p class="message">{page.error?.message}</p>

  <a href="/manage" class="back-button">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
    Back to Dashboard
  </a>
</div>

<style lang="scss">
  .container {
    width: 100%;
    height: 100%;
    min-height: 60vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: var(--space-m);
    padding: var(--space-2xl);
    animation: fadeIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .icon-wrapper {
    position: relative;
    margin-bottom: var(--space-m);
  }

  .icon {
    height: 10rem;
    width: 10rem;
    position: relative;
    z-index: 2;
    filter: drop-shadow(
      0 4px 12px hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.3)
    );
    animation: bounce 2s ease-in-out infinite;
  }

  .icon-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 12rem;
    height: 12rem;
    background: var(--gradient-orb-accent);
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.4;
    z-index: 1;
    animation: pulse 3s ease-in-out infinite;
  }

  .status-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
  }

  .status {
    font-size: clamp(4rem, 8vw, 6rem);
    font-weight: 800;
    background: var(--gradient-hero);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1;
    animation: shimmer 3s ease-in-out infinite;
    background-size: 200% 200%;
  }

  .status-line {
    width: 120px;
    height: 3px;
    background: var(--gradient-stat);
    border-radius: var(--radius-full);
    animation: expandLine 1s ease-out;
  }

  .message {
    font-size: 1.15rem;
    color: var(--txt-main);
    text-align: center;
    max-width: 400px;
    line-height: 1.6;
    margin: 0;
  }

  .back-button {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-s) var(--space-l);
    margin-top: var(--space-m);
    background: var(--gradient-primary);
    color: var(--txt-bold);
    font-weight: 600;
    text-decoration: none;
    border-radius: var(--radius-m);
    border: var(--glass-border-medium);
    box-shadow: var(--shadow-glow-sm);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    svg {
      transition: transform 0.3s ease;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-glow-md);
      border: var(--glass-border-hover);

      svg {
        transform: translateX(-4px);
      }
    }

    &:active {
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.4;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 0.6;
      transform: translate(-50%, -50%) scale(1.1);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  @keyframes expandLine {
    from {
      width: 0;
      opacity: 0;
    }
    to {
      width: 120px;
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    .container {
      padding: var(--space-xl);
    }

    .icon {
      height: 8rem;
      width: 8rem;
    }

    .icon-glow {
      width: 10rem;
      height: 10rem;
    }
  }
</style>
