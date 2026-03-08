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
  return (
    <div
      className="relative"
      style={{
        width: height * 0.45,
        height,
        filter: 'url(#pixelate)',
      }}
    >
      {/* Head */}
      <div
        className="absolute rounded-full"
        style={{
          width: height * 0.22,
          height: height * 0.22,
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: shade,
        }}
      />
      {/* Body */}
      <div
        className="absolute"
        style={{
          width: height * 0.28,
          height: height * 0.32,
          top: height * 0.2,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: shade,
          borderRadius: '3px 3px 0 0',
        }}
      />
      {/* Left leg */}
      <motion.div
        className="absolute"
        style={{
          width: height * 0.11,
          height: height * 0.3,
          top: height * 0.5,
          left: '25%',
          backgroundColor: shade,
          borderRadius: '0 0 2px 2px',
          transformOrigin: 'top center',
        }}
        animate={walking ? { rotate: [15, -15, 15] } : { rotate: 0 }}
        transition={walking ? { duration: 0.4, repeat: Infinity, ease: 'easeInOut' } : {}}
      />
      {/* Right leg */}
      <motion.div
        className="absolute"
        style={{
          width: height * 0.11,
          height: height * 0.3,
          top: height * 0.5,
          left: '55%',
          backgroundColor: shade,
          borderRadius: '0 0 2px 2px',
          transformOrigin: 'top center',
        }}
        animate={walking ? { rotate: [-15, 15, -15] } : { rotate: 0 }}
        transition={walking ? { duration: 0.4, repeat: Infinity, ease: 'easeInOut' } : {}}
      />
      {/* Left arm */}
      <motion.div
        className="absolute"
        style={{
          width: height * 0.08,
          height: height * 0.25,
          top: height * 0.22,
          left: '8%',
          backgroundColor: shade,
          borderRadius: '2px',
          transformOrigin: 'top center',
        }}
        animate={walking ? { rotate: [-20, 20, -20] } : { rotate: 0 }}
        transition={walking ? { duration: 0.4, repeat: Infinity, ease: 'easeInOut' } : {}}
      />
      {/* Right arm */}
      <motion.div
        className="absolute"
        style={{
          width: height * 0.08,
          height: height * 0.25,
          top: height * 0.22,
          right: '8%',
          backgroundColor: shade,
          borderRadius: '2px',
          transformOrigin: 'top center',
        }}
        animate={walking ? { rotate: [20, -20, 20] } : { rotate: 0 }}
        transition={walking ? { duration: 0.4, repeat: Infinity, ease: 'easeInOut' } : {}}
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
      height: 75 + Math.random() * 30, // 75-105px (~2.7x of old 28-40)
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
      {/* SVG pixelation filter */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="pixelate">
            <feFlood x="0" y="0" height="2" width="2" />
            <feComposite width="5" height="5" />
            <feTile result="a" />
            <feComposite in="SourceGraphic" in2="a" operator="in" />
            <feMorphology operator="dilate" radius="2.5" />
          </filter>
        </defs>
      </svg>

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
