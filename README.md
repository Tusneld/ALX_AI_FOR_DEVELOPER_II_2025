# Polling App

A modern, interactive polling application built with Next.js, React, and TypeScript. This application allows users to create, manage, and participate in polls with various customization options.

This project was bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

- **User Authentication**: Register, login, and manage user profiles
- **Poll Creation**: Create customizable polls with multiple options
- **Poll Management**: Edit, delete, and view statistics for your polls
- **Voting System**: Participate in polls with support for anonymous voting
- **Real-time Results**: View poll results as they come in
- **Customization Options**:
  - Set expiration dates for polls
  - Allow/disallow multiple votes per user
  - Enable anonymous voting

## Tech Stack

- **Frontend**: Next.js 15.5, React 19.1, TypeScript
- **Styling**: TailwindCSS 4
- **Development**: Turbopack for fast builds

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Tusneld/ALX_AI_FOR_DEVELOPER_II_2025.git
   cd polling-app
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Project Structure

- `/app`: Next.js app router pages and layouts
- `/components`: Reusable React components
- `/types`: TypeScript type definitions
- `/lib`: Utility functions and shared logic
- `/public`: Static assets

## Data Models

### User

Represents a registered user in the system with properties like id, email, name, and avatar.

### Poll

Represents a poll with customizable options:
- Title and description
- Multiple options for voting
- Expiration date
- Settings for multiple votes and anonymity

### Vote

Represents a user's vote on a specific poll option, tracking the user (if not anonymous) and timestamp.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Next.js and React
- Styled with TailwindCSS
- Developed as part of the ALX AI FOR DEVELOPER II 2025 program
