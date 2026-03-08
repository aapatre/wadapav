import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Customer {
  id: number;
  fromLeft: boolean;
  shade: string;
  height: number;
  delay: number;
  stayDuration: number;
  offsetX: number; // final standing position offset from center
}

const SHADES = ['#555', '#666', '#777', '#888', '#999', '#aaa', '#4a4a4a', '#6b6b6b'];

let customerId = 0;

function CustomerSprite({ shade, height, walking }: { shade: string; height: number; walking: boolean }) {
  // Darker shade for details
  const darkerShade = shade.replace(/[0-9a-f]/gi, c => {
    const v = Math.max(0, parseInt(c, 16) - 2);
    return v.toString(16);
  });
  const lighterShade = shade.replace(/[0-9a-f]/gi, c => {
    const v = Math.min(15, parseInt(c, 16) + 2);
    return v.toString(16);
  });

  const px = Math.max(2, Math.floor(height / 16)); // pixel unit size

  return (
    <div
      className="relative"
      style={{
        width: px * 8,
        height: px * 16,
        imageRendering: 'pixelated',
      }}
    >
      {/* Head - 4x4 block */}
      <div
        className="absolute"
        style={{
          width: px * 4,
          height: px * 4,
          top: 0,
          left: px * 2,
          backgroundColor: shade,
        }}
      />
      {/* Eyes - 2 pixels */}
      <div className="absolute" style={{ width: px, height: px, top: px, left: px * 3, backgroundColor: darkerShade }} />
      <div className="absolute" style={{ width: px, height: px, top: px, left: px * 5, backgroundColor: darkerShade }} />

      {/* Body - 6x5 block */}
      <div
        className="absolute"
        style={{
          width: px * 6,
          height: px * 5,
          top: px * 4,
          left: px * 1,
          backgroundColor: shade,
        }}
      />
      {/* Shirt detail */}
      <div className="absolute" style={{ width: px * 4, height: px, top: px * 5, left: px * 2, backgroundColor: lighterShade }} />

      {/* Left arm */}
      <motion.div
        className="absolute"
        style={{
          width: px * 2,
          height: px * 4,
          top: px * 4,
          left: -px,
          backgroundColor: shade,
          transformOrigin: 'top center',
        }}
        animate={walking ? { rotate: [-25, 25, -25] } : { rotate: 0 }}
        transition={walking ? { duration: 0.35, repeat: Infinity, ease: 'linear' } : {}}
      />
      {/* Right arm */}
      <motion.div
        className="absolute"
        style={{
          width: px * 2,
          height: px * 4,
          top: px * 4,
          right: -px,
          backgroundColor: shade,
          transformOrigin: 'top center',
        }}
        animate={walking ? { rotate: [25, -25, 25] } : { rotate: 0 }}
        transition={walking ? { duration: 0.35, repeat: Infinity, ease: 'linear' } : {}}
      />

      {/* Left leg */}
      <motion.div
        className="absolute"
        style={{
          width: px * 2,
          height: px * 5,
          top: px * 9,
          left: px * 1,
          backgroundColor: darkerShade,
          transformOrigin: 'top center',
        }}
        animate={walking ? { rotate: [20, -20, 20] } : { rotate: 0 }}
        transition={walking ? { duration: 0.35, repeat: Infinity, ease: 'linear' } : {}}
      />
      {/* Right leg */}
      <motion.div
        className="absolute"
        style={{
          width: px * 2,
          height: px * 5,
          top: px * 9,
          right: px * 1,
          backgroundColor: darkerShade,
          transformOrigin: 'top center',
        }}
        animate={walking ? { rotate: [-20, 20, -20] } : { rotate: 0 }}
        transition={walking ? { duration: 0.35, repeat: Infinity, ease: 'linear' } : {}}
      />
    </div>
  );
}

export default function CustomerCrowd() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [phases, setPhases] = useState<Record<number, 'entering' | 'standing' | 'leaving'>>({});
  const timeoutsRef = useRef<number[]>([]);

  const spawnCustomer = useCallback(() => {
    const fromLeft = Math.random() > 0.5;
    const id = ++customerId;
    const customer: Customer = {
      id,
      fromLeft,
      shade: SHADES[Math.floor(Math.random() * SHADES.length)],
      height: 28 + Math.random() * 12, // 28-40px
      delay: 0,
      stayDuration: 2000 + Math.random() * 3000,
      offsetX: (Math.random() - 0.5) * 60, // spread around center
    };

    setCustomers(prev => [...prev.slice(-5), customer]);
    setPhases(prev => ({ ...prev, [id]: 'entering' }));

    // After walk-in, stand
    const t1 = window.setTimeout(() => {
      setPhases(prev => ({ ...prev, [id]: 'standing' }));

      // After standing, leave
      const t2 = window.setTimeout(() => {
        setPhases(prev => ({ ...prev, [id]: 'leaving' }));

        // Remove after leave animation
        const t3 = window.setTimeout(() => {
          setCustomers(prev => prev.filter(c => c.id !== id));
          setPhases(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }, 1500);
        timeoutsRef.current.push(t3);
      }, customer.stayDuration);
      timeoutsRef.current.push(t2);
    }, 1500);
    timeoutsRef.current.push(t1);
  }, []);

  useEffect(() => {
    // Spawn customers at random intervals
    const spawn = () => {
      spawnCustomer();
      const next = 1500 + Math.random() * 3000;
      const t = window.setTimeout(spawn, next);
      timeoutsRef.current.push(t);
    };

    // Initial spawn
    const t = window.setTimeout(spawn, 500);
    timeoutsRef.current.push(t);

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [spawnCustomer]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {customers.map(c => {
          const phase = phases[c.id] || 'entering';
          const enterX = c.fromLeft ? -80 : 80;
          const leaveX = c.fromLeft ? -80 : 80;
          const standX = c.offsetX;

          return (
            <motion.div
              key={c.id}
              className="absolute"
              style={{
                bottom: 44,
                left: '50%',
                opacity: 0.7,
              }}
              initial={{ x: enterX, opacity: 0 }}
              animate={
                phase === 'entering'
                  ? { x: standX, opacity: 0.7 }
                  : phase === 'standing'
                  ? { x: standX, opacity: 0.7 }
                  : { x: leaveX, opacity: 0 }
              }
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            >
              <CustomerSprite
                shade={c.shade}
                height={c.height}
                walking={phase !== 'standing'}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
