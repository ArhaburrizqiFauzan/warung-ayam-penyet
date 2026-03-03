import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '../src/components/ui/card';

describe('Card Component Suite', () => {
    it('renders a complete card structure', () => {
        render(
            <Card data-testid="card">
                <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Card Content</p>
                </CardContent>
                <CardFooter>
                    <button>Card Footer Button</button>
                </CardFooter>
            </Card>
        );

        expect(screen.getByTestId('card')).toBeInTheDocument();
        expect(screen.getByText('Card Title')).toBeInTheDocument();
        expect(screen.getByText('Card Description')).toBeInTheDocument();
        expect(screen.getByText('Card Content')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /card footer button/i })).toBeInTheDocument();
    });

    it('applies custom classNames to the Card', () => {
        render(
            <Card data-testid="custom-card" className="custom-test-class">
                Content
            </Card>
        );

        const card = screen.getByTestId('custom-card');
        expect(card).toHaveClass('custom-test-class');
    });
});
