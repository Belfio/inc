# Internet Native Companies (INC) - Solana Program PRD (Anchor)

## 1. Project Overview

Internet Native Companies (INC) is a Solana program developed using the Anchor framework. It enables the creation and management of decentralized companies on the Solana blockchain, providing transparency, efficiency, and decentralized governance.

### 1.1 Target Audience

- Entrepreneurs looking to create decentralized organizations on Solana
- Existing companies wanting to transition to a more transparent structure
- DAOs seeking a formalized structure on Solana

### 1.2 Key Benefits

- Increased transparency in company operations
- Efficient shareholder management using Solana's high-performance blockchain
- Decentralized decision-making processesz
- Automated treasury management

## 2. System Architecture

The INC system consists of the following Anchor programs:

1. INC Factory Program
2. INC Program
3. Token Program (for both Voting and Share tokens)

The INC system comes with also a Web3 Front End:

1. INC Factory app
2. INC public page
3. INC private page

## 3. Program Specifications

### 3.1 INC Factory Program

#### Purpose

Creates and manages new INC instances.

#### Accounts

1. `CompanyRegistry`: Stores the list of created companies
   ```rust
   #[account]
   pub struct CompanyRegistry {
       pub companies: Vec<Pubkey>,
   }
   ```

#### Instructions

1. `create_company(name: String, jurisdiction: String, shareholders: Vec<Pubkey>, share_amounts: Vec<u64>, voters: Vec<Pubkey>, vote_amounts: Vec<u64>) -> ProgramResult`

   - Creates a new INC instance
   - Ensures unique company name
   - Initializes associated Token and Treasury accounts
   - Returns the address of the new INC account

2. `get_company_list() -> Vec<Pubkey>`

   - Returns a list of all created INC addresses

3. `get_company_by_name(name: String) -> Pubkey`
   - Returns the address of an INC by its name

#### Errors

```rust
#[error_code]
pub enum IncFactoryError {
    #[msg("Company name already taken")]
    NameAlreadyTaken,
    #[msg("Invalid company name")]
    InvalidName,
}
```

### 3.2 Token Program

#### Purpose

Manages voting and share tokens for an INC.

#### Accounts

1. `TokenAccount`: Stores token information
   ```rust
   #[account]
   pub struct TokenAccount {
       pub is_voting_token: bool,
       pub total_supply: u64,
       pub balances: Vec<(Pubkey, u64)>,
   }
   ```

#### Instructions

1. `initialize(is_voting_token: bool, initial_holders: Vec<Pubkey>, initial_amounts: Vec<u64>) -> ProgramResult`
2. `transfer(to: Pubkey, amount: u64) -> ProgramResult`
3. `mint(to: Pubkey, amount: u64) -> ProgramResult`
4. `burn(from: Pubkey, amount: u64) -> ProgramResult`

#### Errors

```rust
#[error_code]
pub enum TokenError {
    #[msg("Insufficient balance")]
    InsufficientBalance,
    #[msg("Overflow")]
    Overflow,
}
```

### 3.3 INC Program

#### Purpose

Manages the core functionality of an Internet Native Company, including governance and treasury operations.

#### Accounts

1. `IncAccount`: Stores INC information

   ```rust
   #[account]
   pub struct IncAccount {
       pub name: String,
       pub jurisdiction: String,
       pub voting_token: Pubkey,
       pub share_token: Pubkey,
       pub proposals: Vec<Proposal>,
   }
   ```

2. `Proposal`: Stores proposal information

   ```rust
   #[account]
   pub struct Proposal {
       pub id: u64,
       pub description: String,
       pub proposer: Pubkey,
       pub votes_for: u64,
       pub votes_against: u64,
       pub executed: bool,
       pub canceled: bool,
   }
   ```

3. `TreasuryAccount`: Stores treasury information
   ```rust
   #[account]
   pub struct TreasuryAccount {
       pub balance: u64,
       pub inc: Pubkey,
   }
   ```

#### Instructions

1. `initialize(name: String, jurisdiction: String, voting_token: Pubkey, share_token: Pubkey) -> ProgramResult`
2. `create_proposal(description: String) -> ProgramResult`
3. `execute_proposal(proposal_id: u64) -> ProgramResult`
4. `cancel_proposal(proposal_id: u64) -> ProgramResult`
5. `cast_vote(proposal_id: u64, support: bool) -> ProgramResult`
6. `transfer_funds(to: Pubkey, amount: u64) -> ProgramResult`
7. `deposit_funds(amount: u64) -> ProgramResult`
8. `get_treasury_balance() -> u64`

#### Errors

```rust
#[error_code]
pub enum IncError {
    #[msg("Proposal does not exist")]
    ProposalNotFound,
    #[msg("Proposal already executed")]
    ProposalAlreadyExecuted,
    #[msg("Insufficient voting power")]
    InsufficientVotingPower,
    #[msg("Insufficient treasury funds")]
    InsufficientFunds,
    #[msg("Unauthorized treasury operation")]
    UnauthorizedTreasuryOperation,
}
```

## 4. App Specifications

### 4.1 Purpose

Develop a user-friendly web application that allows users to interact with the INC programs on the Solana blockchain. The app will enable users to:

- Create and manage Internet Native Companies.
- Participate in governance through proposals and voting.
- Manage treasury operations securely.
- View public and private company information.

### 4.2 Technology Stack

- **Front-End Framework**: React (with TypeScript)
- **Build Tool**: Vite.js
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui
- **Routing**: Folder/File-based routing using React Router
- **State Management**: React Context API or alternative as needed
- **Blockchain Interaction**: Solana's Web3.js and Anchor's client libraries
- **Package Manager**: npm or yarn
- **Testing Framework**: Jest and React Testing Library
- **Linting and Formatting**: ESLint and Prettier

### 4.3 Key Features

- **Company Creation Wizard**
  - Step-by-step guided process to create a new INC.
  - Form validation, including company name uniqueness.
  - Integration with the INC Factory Program's create_company instruction.
- **User Dashboard**
  - Overview of user's companies and roles.
  - Notifications for pending proposals and votes.
  - Quick access to recent activities and important metrics.
- **Company Public Page**
  - Display public information about the INC.
  - View proposals, shareholder information, and company metrics.
  - Shareable links to promote transparency.
- **Company Private Page**
  - Secure access for authorized users.
  - Manage proposals: create, view, and participate.
  - Treasury operations: view balance, deposit, and initiate transfers.
  - Token management for shares and voting tokens.
- **Authentication**
  - Integration with Solana wallets (e.g., Phantom, Solflare).
  - Secure wallet connection and transaction signing.
- **Responsive Design**
  - Mobile-first approach ensuring usability across devices.
  - Accessibility compliance (WCAG 2.1 Level AA).
- **Notifications and Real-time Updates**
  - Real-time data fetching using WebSockets or polling.
  - Alert users of new proposals, votes, and treasury changes.

### 4.4 Project Structure

Implement folder/file-based routing for scalability and ease of maintenance.

Example Project Structure:

## 5. Security Considerations

- Implement proper access control using Anchor's `#[access_control]` attribute
- Use Anchor's constraint checks to validate account data
- Implement a secure mechanism for treasury operations, ensuring only authorized instructions can modify the treasury
- Conduct thorough testing using Anchor's testing framework
- Perform security audits before deployment to mainnet
- Implement a multisig mechanism for critical operations, especially those involving treasury management

## 6. Future Developments

- Implement program upgrades using Solana's upgradeable BPF loader
- Explore integration with other Solana programs (e.g., Serum DEX for token trading)
- Develop a Rust-based client SDK for easy integration
- Create a user-friendly web interface using Solana web3.js
- Implement more advanced treasury management features, such as multi-asset support or yield-generating strategies

<!-- ## 7. Docs -->

## 8. Current File Structure

Programs are inside the /programs directory. Web3 apps are inside the /app directory.

### 8.1 Programs Directory Structure

```

programs/
 ├─ inc-factory/
 │   ├─ src/
 │   │   ├─ lib.rs  // Core logic for creating and managing INC instances
 │   │   └─ ...     // Additional modules and utilities
 ├─ inc/
 │   ├─ src/
 │   │   ├─ lib.rs  // Core logic for managing Internet Native Companies
 │   │   └─ ...     // Additional modules and utilities
 ├─ token/
 │   ├─ src/
 │   │   ├─ lib.rs  // Logic for managing voting and share tokens
 │   │   └─ ...     // Additional modules and utilities
 ├─ common/
 │   └─ ...         // Shared utilities and libraries
 ├─ tests/
 │   ├─ inc.ts      // Test scripts for the INC program
 │   └─ ...         // Additional test scripts
```

### 8.2 App Directory Structure

```

app/
 ├─ src/
 │   ├─ components/
 │   │   ├─ Button.tsx        // Reusable button component
 │   │   ├─ Modal.tsx         // Reusable modal component
 │   │   └─ ...               // Other reusable components
 │   ├─ pages/
 │   │   ├─ Dashboard/
 │   │   │   └─ index.tsx     // Main dashboard page
 │   │   ├─ Company/
 │   │   │   ├─ [companyId]/
 │   │   │   │   ├─ index.tsx // Company overview page
 │   │   │   │   ├─ Proposals.tsx // Page for managing proposals
 │   │   │   │   ├─ Shareholders.tsx // Page for viewing shareholders
 │   │   │   │   └─ Treasury.tsx // Page for treasury operations
 │   │   ├─ CreateCompany/
 │   │   │   └─ index.tsx     // Page for creating a new company
 │   │   └─ ...               // Other pages
 │   ├─ routes/
 │   │   └─ index.tsx         // Main routing configuration
 │   ├─ styles/
 │   │   ├─ globals.css       // Global styles
 │   │   └─ tailwind.config.js // Tailwind CSS configuration
 │   ├─ App.tsx               // Main application component
 │   ├─ main.tsx              // Application entry point
 │   └─ ...                   // Other source files
 ├─ public/
 │   └─ ...                   // Static assets
 ├─ tests/
 │   └─ ...                   // Test files for the application
 ├─ package.json              // App dependencies and scripts
 ├─ README.md                 // Documentation for the app
 └─ ...
```

## 9. Additional Requirements

1. Program setup

- All the contracts code is written in Rust and uses the Anchor library
- All the contracts fo in the contractName/src folder inside programs/

1. App setup
