/**
 * Animation utilities for smooth counter animations
 */

export interface AnimationOptions {
  duration?: number;
  easing?: (progress: number) => number;
}

export interface CounterAnimationCallbacks {
  onUpdate: (currentCount: number) => void;
}

/**
 * Animates a counter from start value to target value with smooth easing
 * @param startCount - The starting count value
 * @param targetCount - The target count value to animate to
 * @param callbacks - Object containing the onUpdate callback function
 * @param options - Optional animation configuration
 */
export const animateCounter = (
  startCount: number,
  targetCount: number,
  callbacks: CounterAnimationCallbacks,
  options: AnimationOptions = {}
) => {
  const duration = options.duration || 800; // Default 0.8 seconds
  const easing = options.easing || ((progress: number) => 1 - Math.pow(1 - progress, 4)); // Default easeOutQuart
  const startTime = Date.now();

  const updateCounter = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Apply easing function for smooth animation
    const easedProgress = easing(progress);
    const currentCount = Math.round(startCount + (targetCount - startCount) * easedProgress);

    // Call the update callback with the current count
    callbacks.onUpdate(currentCount);
    
    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    }
  };
  
  requestAnimationFrame(updateCounter);
};

/**
 * Predefined easing functions
 */
export const easingFunctions = {
  linear: (progress: number) => progress,
  easeOutQuart: (progress: number) => 1 - Math.pow(1 - progress, 4),
  easeOutCubic: (progress: number) => 1 - Math.pow(1 - progress, 3),
  easeOutQuad: (progress: number) => 1 - Math.pow(1 - progress, 2),
  easeInOutQuart: (progress: number) => progress < 0.5 
    ? 8 * progress * progress * progress * progress 
    : 1 - Math.pow(-2 * progress + 2, 4) / 2,
};
