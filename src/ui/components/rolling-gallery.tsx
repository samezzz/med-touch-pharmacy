import React, { useEffect, useMemo, useState } from 'react';
import { motion, useMotionValue, useAnimation, useTransform, PanInfo, ResolvedValues } from 'motion/react';
import Image from 'next/image';
import { useTheme } from 'next-themes';

const IMGS: string[] = [
  'https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=3456&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1495103033382-fe343886b671?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1506781961370-37a89d6b3095?q=80&w=3264&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1599576838688-8a6c11263108?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1494094892896-7f14a4433b7a?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://plus.unsplash.com/premium_photo-1664910706524-e783eed89e71?q=80&w=3869&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1503788311183-fa3bf9c4bc32?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1585970480901-90d6bb2a48b5?q=80&w=3774&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
];

interface RollingGalleryItem {
  src: string;
  name?: string;
}

interface RollingGalleryProps {
  autoplay?: boolean;
  pauseOnHover?: boolean;
  images?: string[]; // backwards compatibility
  labels?: string[]; // optional labels matching images by index
  items?: RollingGalleryItem[]; // preferred: provide { src, name }
}

const RollingGallery: React.FC<RollingGalleryProps> = ({ autoplay = false, pauseOnHover = false, images = [], labels = [], items = [] }) => {
  const { resolvedTheme } = useTheme();
  // Normalize into items with src + optional name for rendering
  const galleryItems: RollingGalleryItem[] = useMemo(() => {
    if (items.length > 0) return items;
    if (images.length > 0) return images.map((src, i) => ({ src, name: labels[i] }));
    return IMGS.map((src) => ({ src }));
  }, [images, items, labels]);
  const fallbackSrc = useMemo(() => (
    resolvedTheme === 'dark' ? '/placeholder-dark.svg' : '/placeholder.svg'
  ), [resolvedTheme]);

  const [isScreenSizeSm, setIsScreenSizeSm] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth <= 640 : false);
  useEffect(() => {
    const handleResize = () => setIsScreenSizeSm(window.innerWidth <= 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Wider cylinder so faces are larger and spaced nicely

  // Use requested widths depending on screen size
  const cylinderWidth: number = isScreenSizeSm ? 2400 : 2900;
  
  
  const faceCount: number = galleryItems.length;
  // Ensure faces do not overlap: keep width under the arc per face
  const faceWidth: number = (cylinderWidth / faceCount) * 1.02;
  const radius: number = cylinderWidth / (2 * Math.PI);
  const itemHeight: number = isScreenSizeSm ? 160 : 240;

  const dragFactor: number = 0.05;
  const rotation = useMotionValue(0);
  const controls = useAnimation();

  const transform = useTransform(rotation, (val: number) => `rotate3d(0,1,0,${val}deg)`);

  const startInfiniteSpin = (startAngle: number) => {
    controls.start({
      rotateY: [startAngle, startAngle - 360],
      transition: {
        duration: 30,
        ease: 'linear',
        repeat: Infinity
      }
    });
  };

  useEffect(() => {
    if (autoplay) {
      const currentAngle = rotation.get();
      startInfiniteSpin(currentAngle);
    } else {
      controls.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const handleUpdate = (latest: ResolvedValues) => {
    if (typeof latest.rotateY === 'number') {
      rotation.set(latest.rotateY);
    }
  };

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void => {
    controls.stop();
    rotation.set(rotation.get() + info.offset.x * dragFactor);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void => {
    const finalAngle = rotation.get() + info.velocity.x * dragFactor;
    rotation.set(finalAngle);
    if (autoplay) {
      startInfiniteSpin(finalAngle);
    }
  };

  const handleMouseEnter = (): void => {
    if (autoplay && pauseOnHover) {
      controls.stop();
    }
  };

  const handleMouseLeave = (): void => {
    if (autoplay && pauseOnHover) {
      const currentAngle = rotation.get();
      startInfiniteSpin(currentAngle);
    }
  };

  return (
    <div className="relative w-full overflow-hidden h-[360px] md:h-[420px]">
      <div className="flex h-full items-center justify-center [perspective:1000px] [transform-style:preserve-3d]">
        <motion.div
          drag="x"
          dragElastic={0}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          animate={controls}
          onUpdate={handleUpdate}
          style={{
            transform: transform,
            rotateY: rotation,
            width: cylinderWidth,
            transformStyle: 'preserve-3d'
          }}
          className="flex min-h-[200px] cursor-grab items-center justify-center [transform-style:preserve-3d]"
        >
          {galleryItems.map(({ src, name }, i) => (
            <div
              key={i}
              className="group absolute p-2 [backface-visibility:hidden]"
              style={{
                width: `${faceWidth}px`,
                height: `${itemHeight}px`,
                transform: `rotateY(${(360 / faceCount) * i}deg) translateZ(${radius}px)`
              }}
            >
              <div className="relative h-full w-full overflow-hidden rounded-2xl border border-border bg-background shadow-lg transition-transform duration-300 ease-out group-hover:scale-[1.02] flex flex-col">
                <div className="relative flex-1">
                  <Image
                    src={!src || src.includes('/placeholder') ? fallbackSrc : src}
                    alt={name || 'category'}
                    draggable={false}
                    onPointerDown={(e) => e.preventDefault()}
                    fill
                    sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 30vw"
                    className="object-cover select-none"
                  />
                </div>
                {name ? (
                  <div className="pointer-events-none border-t border-border/60 bg-accent/50 px-3 py-2">
                    <div className="truncate text-center text-xs md:text-sm font-medium text-foreground/80">{name}</div>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default RollingGallery;
