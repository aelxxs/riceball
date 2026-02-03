<script lang="ts">
import { onMount } from "svelte";
import { fade, fly, scale } from "svelte/transition";

let mounted = false;
let mouseX = 0;
let mouseY = 0;
let particles: Array<{
	id: number;
	x: number;
	y: number;
	size: number;
	duration: number;
}> = [];

onMount(() => {
	mounted = true;
	// Generate initial particles
	generateParticles();
});

function generateParticles() {
	particles = Array.from({ length: 15 }, (_, i) => ({
		id: i,
		x: Math.random() * 100,
		y: Math.random() * 100,
		size: Math.random() * 4 + 2,
		duration: Math.random() * 20 + 15,
	}));
}

function handleMouseMove(e: MouseEvent) {
	mouseX = e.clientX;
	mouseY = e.clientY;
}

function handleFeatureClick(feature: string) {
	console.log(`Clicked on ${feature}`);
}
</script>

<svelte:window on:mousemove={handleMouseMove} />

<div class="landing">
  <!-- Animated Background -->
  <div class="background">
    <div class="gradient-orb orb-1"></div>
    <div class="gradient-orb orb-2"></div>
    <div class="gradient-orb orb-3"></div>

    <!-- Particles -->
    <div class="particles-container">
      {#each particles as particle (particle.id)}
        <div
          class="particle"
          style="--x: {particle.x}%; --y: {particle.y}%; --size: {particle.size}px; --duration: {particle.duration}s"
        ></div>
      {/each}
    </div>

    <!-- Grid -->
    <div class="grid"></div>
  </div>

  <!-- Cursor Glow -->
  <div
    class="cursor-glow"
    style="--mouse-x: {mouseX}px; --mouse-y: {mouseY}px"
  ></div>

  <!-- Navigation Header -->
  {#if mounted}
    <nav class="navbar" in:fade={{ duration: 600 }}>
      <div class="navbar-content">
        <a href="/" class="logo">
          <img src="/icon.svg" alt="Riceball" />
          <span>Riceball</span>
        </a>
        <div class="nav-links">
          <a href="/docs" class="nav-link">Docs</a>
          <a href="/support" class="nav-link">Support</a>
          <a href="/invite" class="nav-link">Invite</a>
        </div>
        <div class="auth-buttons">
          <a href="/login" class="btn btn-secondary btn-sm">Log In</a>
          <a href="/manage" class="btn btn-primary btn-sm">Dashboard</a>
        </div>
      </div>
    </nav>
  {/if}

  <!-- Content -->
  <div class="content">
    <!-- Hero Section -->
    <section class="hero">
      {#if mounted}
        <div class="hero-content" in:fly={{ y: 40, duration: 800, delay: 200 }}>
          <div class="badge" in:fade={{ duration: 600, delay: 300 }}>
            <span class="pulse"></span>
            Available now
          </div>

          <h1 class="title">
            <span class="word" in:fly={{ y: 20, duration: 600, delay: 400 }}
              >Empower</span
            >
            <span class="word" in:fly={{ y: 20, duration: 600, delay: 500 }}
              >Your</span
            >
            <span
              class="word gradient-text"
              in:fly={{ y: 20, duration: 600, delay: 600 }}>Community</span
            >
          </h1>

          <p class="subtitle" in:fade={{ duration: 600, delay: 700 }}>
            Riceball brings powerful leveling, economy, and engagement tools to
            your Discord server. Customize everything to match your community's
            unique vibe.
          </p>

          <div class="cta-buttons" in:fade={{ duration: 600, delay: 800 }}>
            <button
              class="btn btn-primary"
              onclick={() => (window.location.href = "/invite")}
            >
              <span>Invite Riceball</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button
              class="btn btn-secondary"
              onclick={() => (window.location.href = "/docs")}
            >
              Explore Docs
            </button>
          </div>
        </div>

        <div
          class="hero-visual"
          in:scale={{ duration: 800, delay: 400, start: 0.8 }}
        >
          <div class="floating-card card-1">
            <div class="card-header">Leveling</div>
            <div class="card-icon">📈</div>
          </div>
          <div class="floating-card card-2">
            <div class="card-header">Economy</div>
            <div class="card-icon">💰</div>
          </div>
          <div class="floating-card card-3">
            <div class="card-header">Starboard</div>
            <div class="card-icon">⭐</div>
          </div>
        </div>
      {/if}
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="section-header" in:fade={{ duration: 600, delay: 900 }}>
        <h2>Packed with Features</h2>
        <p>Everything you need to build an amazing community</p>
      </div>

      <div class="features-grid">
        {#each [{ icon: "📈", title: "Leveling", desc: "Advanced leveling system with customizable rewards" }, { icon: "💰", title: "Economy", desc: "Full economy system with shops and currency" }, { icon: "⭐", title: "Starboard", desc: "Highlight popular messages from your community" }, { icon: "🎭", title: "Reaction Roles", desc: "Self-assignable roles through reactions" }, { icon: "🛍️", title: "Shop", desc: "Create and manage in-server item shops" }, { icon: "🤖", title: "Custom Commands", desc: "Build powerful automated custom commands" }] as feature, index}
          <div
            class="feature-card"
            in:fly={{ y: 20, duration: 600, delay: 1000 + index * 100 }}
            onclick={() => handleFeatureClick(feature.title)}
            role="button"
            tabindex="0"
          >
            <div class="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.desc}</p>
          </div>
        {/each}
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats" in:fade={{ duration: 600, delay: 1400 }}>
      {#each [{ number: "50K+", label: "Servers" }, { number: "2M+", label: "Users" }, { number: "99.9%", label: "Uptime" }, { number: "24/7", label: "Support" }] as stat, index}
        <div
          class="stat-item"
          in:scale={{ duration: 600, delay: 1500 + index * 100, start: 0.8 }}
        >
          <div class="stat-number">{stat.number}</div>
          <div class="stat-label">{stat.label}</div>
        </div>
      {/each}
    </section>

    <!-- CTA Section -->
    <section class="final-cta" in:fade={{ duration: 600, delay: 1800 }}>
      <h2>Ready to Transform Your Server?</h2>
      <p>Join thousands of communities already using Riceball</p>
      <button class="btn btn-primary btn-large">
        Get Started Now
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  </div>
</div>

<style lang="scss">
  .landing {
    position: relative;
    width: 100%;
    min-height: 100vh;
    overflow-x: hidden;
    background: #0a0e27;
    color: #fff;
  }

  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: var(--navbar-bg);
    backdrop-filter: blur(10px);
    border-bottom: var(--glass-border-subtle);
    padding: 16px 0;
  }

  .navbar-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 40px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    font-weight: 700;
    font-size: 1.25rem;
    color: white;
    transition: opacity 0.3s ease;

    img {
      width: 32px;
      height: 32px;
    }

    &:hover {
      opacity: 0.8;
    }
  }

  .nav-links {
    display: flex;
    gap: 32px;
    flex: 1;

    @media (max-width: 768px) {
      display: none;
    }
  }

  .nav-link {
    color: var(--clr-neutral);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;

    &:hover {
      color: var(--clr-primary);
    }
  }

  .auth-buttons {
    display: flex;
    gap: 12px;
    align-items: center;

    @media (max-width: 768px) {
      gap: 8px;
    }
  }

  .btn-sm {
    padding: 8px 16px;
    font-size: 0.875rem;
  }

  .background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;

    .gradient-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.3;
      animation: float 20s ease-in-out infinite;

      &.orb-1 {
        width: 400px;
        height: 400px;
        background: var(--gradient-orb-primary);
        top: -100px;
        left: -100px;
        animation-delay: 0s;
      }

      &.orb-2 {
        width: 300px;
        height: 300px;
        background: var(--gradient-orb-secondary);
        bottom: -50px;
        right: -50px;
        animation-delay: -5s;
      }

      &.orb-3 {
        width: 350px;
        height: 350px;
        background: var(--gradient-orb-accent);
        top: 50%;
        right: 10%;
        animation-delay: -10s;
      }
    }

    .particles-container {
      position: absolute;
      width: 100%;
      height: 100%;

      .particle {
        position: absolute;
        left: var(--x);
        top: var(--y);
        width: var(--size);
        height: var(--size);
        background: var(--gradient-orb-primary);
        border-radius: 50%;
        animation: float var(--duration) ease-in-out infinite;
        opacity: 0.5;
      }
    }

    .grid {
      position: absolute;
      width: 100%;
      height: 100%;
      background-image: var(--grid-pattern);
      background-size: 50px 50px;
      animation: grid-slide 20s linear infinite;
    }
  }

  .cursor-glow {
    position: fixed;
    width: 400px;
    height: 400px;
    left: var(--mouse-x);
    top: var(--mouse-y);
    transform: translate(-50%, -50%);
    background: var(--cursor-glow);
    border-radius: 50%;
    pointer-events: none;
    z-index: 1;
    filter: blur(60px);
  }

  .content {
    position: relative;
    z-index: 10;
    max-width: 1400px;
    margin: 0 auto;
    padding: 40px 20px 60px 20px;
  }

  .hero {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
    min-height: 100vh;
    padding: 60px 0;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 40px;
      min-height: auto;
    }
  }

  .hero-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--glass-bg-light);
    border: var(--glass-border-medium);
    border-radius: 24px;
    width: fit-content;
    font-size: 14px;
    font-weight: 500;

    .pulse {
      display: inline-block;
      width: 8px;
      height: 8px;
      background: var(--pulse-color);
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }
  }

  .title {
    font-size: 4rem;
    font-weight: 700;
    line-height: 1.2;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .word {
      display: block;
    }

    .gradient-text {
      background: var(--gradient-hero);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: gradient-shift 4s ease infinite;
    }

    @media (max-width: 768px) {
      font-size: 2.5rem;
    }
  }

  .subtitle {
    font-size: 1.125rem;
    line-height: 1.6;
    color: var(--clr-neutral);
    max-width: 500px;
  }

  .cta-buttons {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;

    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  .btn {
    padding: 14px 28px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;

    &.btn-primary {
      background: var(--gradient-primary);
      color: white;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-glow-md);
      }

      &:active {
        transform: translateY(0);
      }
    }

    &.btn-secondary {
      background: var(--glass-bg-light);
      color: var(--clr-cyan);
      border: var(--glass-border-medium);

      &:hover {
        background: var(--glass-bg-strong);
        border: var(--glass-border-hover);
      }
    }

    &.btn-large {
      padding: 16px 40px;
      font-size: 1.1rem;
    }
  }

  .hero-visual {
    position: relative;
    height: 500px;
    display: none;

    @media (min-width: 768px) {
      display: block;
    }
  }

  .floating-card {
    position: absolute;
    width: 140px;
    height: 140px;
    background: var(--glass-bg-light);
    border: var(--glass-border-medium);
    border-radius: 16px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    backdrop-filter: blur(10px);
    animation: float 4s ease-in-out infinite;

    .card-header {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--clr-cyan);
    }

    .card-icon {
      font-size: 40px;
    }

    &.card-1 {
      top: 0;
      left: 0;
      animation-delay: 0s;
    }

    &.card-2 {
      top: 50%;
      right: 0;
      animation-delay: -1s;
    }

    &.card-3 {
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      animation-delay: -2s;
    }
  }

  .features {
    margin-top: 100px;
  }

  .section-header {
    text-align: center;
    margin-bottom: 60px;

    h2 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 12px;
    }

    p {
      font-size: 1.125rem;
      color: var(--clr-neutral);
    }
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }

  .feature-card {
    padding: 32px;
    background: var(--glass-bg-subtle);
    border: var(--glass-border-light);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);

    &:hover {
      background: var(--glass-bg-light);
      border: var(--glass-border-strong);
      transform: translateY(-4px);
    }

    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 16px;
    }

    h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 8px;
    }

    p {
      color: var(--clr-neutral);
      line-height: 1.6;
    }
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 32px;
    margin-top: 100px;
    padding: 60px 0;
  }

  .stat-item {
    text-align: center;

    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      background: var(--gradient-stat);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
    }

    .stat-label {
      color: var(--clr-neutral);
      font-size: 1rem;
    }
  }

  .final-cta {
    text-align: center;
    padding: 80px 20px;
    margin-top: 80px;

    h2 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 12px;
    }

    p {
      font-size: 1.125rem;
      color: var(--clr-neutral);
      margin-bottom: 32px;
    }
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes gradient-shift {
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

  @keyframes grid-slide {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(50px);
    }
  }
</style>
