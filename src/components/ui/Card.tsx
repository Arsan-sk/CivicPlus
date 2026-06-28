import React, { forwardRef } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  glass?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  interactive = false,
  glass = false,
  className = '',
  ...props
}, ref) => {
  const classes = [
    'card',
    interactive ? 'card-interactive' : '',
    glass ? 'glass' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';

