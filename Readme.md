# INC - Internet Native Companies

## TODO:

1. Read this for voting system: https://www.ih21.org/en/guidelines

## Deployment

Change Anchor.toml

[provider]
cluster = "localnet"
wallet = "~/.config/solana/id.json"
to
[provider]
cluster = "devnet"
wallet = "/Users/alfredo/.config/solana/id.json"

Devent
Program Id: 7kmLroKer2JooHLqQi8ugBRHhVVTudxUm1JsAa9gpyhK
Signature: 3YJFajrpGqfUDA9a7aamJGtcdF3DZRizbUyRUzRhLLtSK1cjZnzUxJwVDA6dBUkRCX45jQ2EyyQY7WcHiX89sfqa

## What

A set of programs (smart contracts) that enable the creation of an Internet Native Company (INC). An INC is an entity registered on the blockchain. The blockchain of choice is Solana. This set of programs allows the creation and management of a company on the blockchain, with functionality for shareholder management and treasury operations.

## Simple Summary

When two or more individuals seek to establish a business, they must select a jurisdiction for the company's base, navigate the regulatory processes for incorporation, secure a banking institution for account setup, initiate payment processing, and commence operations.

INC offers a permissionless framework for company and bank account creation, complemented by automation tools.

## Why

Traditional company structures rely on government regulations and lack the inherent flexibility and efficiency that modern software-driven organizations demand. Establishing a conventional company involves several time-consuming and often costly steps:

1. **Choice of Jurisdiction:** Selecting a country to base the company, each with its own set of regulations and compliance requirements.
2. **Regulatory Compliance:** Paying fees and navigating the legal processes to officially register the company.
3. **Banking Infrastructure:** Opening bank accounts with institutions that approve and support the company's operations.
4. **Financial Automation:** Developing and implementing the necessary payment systems and financial automations to sustain business operations.

With **Internet Native Companies (INC)**, all these steps are transformed into a **permissionless** and **automated** process:

- **Decentralized and Transparent Management:** INC leverages the Solana blockchain to provide a transparent ledger of company ownership and fund allocations, eliminating the need for centralized authorities.
- **Automated Shareholder Management:** Through tokenization, INC facilitates efficient and automated distribution and management of shares, enabling seamless shareholder interactions and transactions.
- **Secure Financial Transactions:** The blockchain framework ensures that all financial operations are conducted securely and swiftly, reducing the risks associated with traditional banking systems.
- **Flexible Administrative Structure:** INC's decentralized governance model allows for adaptable administrative processes that can be tailored to the specific needs of various companies, promoting agility and responsiveness in decision-making.

By decentralizing these core aspects of company formation and management, INC not only reduces the barriers to creating and running a business but also introduces a new level of efficiency, security, and adaptability that traditional structures struggle to offer.

## What

**Internet Native Companies (INC)** is a comprehensive suite of smart contracts and web applications built on the Solana blockchain using the Anchor framework. INC enables entrepreneurs, existing companies, and DAOs to establish and manage decentralized organizations with enhanced transparency, efficient shareholder management, secure treasury operations, and the ability to send and receive a stablecoin currency called **Inccoin**. By leveraging Solana's high-performance blockchain, INC ensures scalable and reliable operations for modern, software-driven companies seeking decentralized governance and automation.

## How

INC achieves the creation and management of decentralized companies through a combination of robust smart contracts and a user-friendly Web3 front-end application. Here's an overview of how the system is structured and operates:

### Smart Contracts (Programs)

1. **INC Factory Program**

   - **Purpose:** Facilitates the creation and management of new INC instances.
   - **Functionality:** Allows users to create companies by specifying details such as name, jurisdiction, shareholders, and voting mechanisms. Maintains a registry of all created companies.
   - **Key Features:**
     - `create_company`: Initializes a new INC with specified parameters.
     - `get_company_list`: Retrieves a list of all registered companies.
     - `get_company_by_name`: Fetches company details based on its name.

2. **INC Program**

   - **Purpose:** Manages the core operations of an Internet Native Company, including governance and treasury management.
   - **Functionality:** Handles proposal creation, voting processes, treasury deposits and withdrawals, and overall governance mechanisms.
   - **Key Features:**
     - `create_proposal`: Allows authorized users to create new governance proposals.
     - `cast_vote`: Enables shareholders to vote on proposals.
     - `execute_proposal`: Executes approved proposals.
     - `deposit_funds` & `transfer_funds`: Manages treasury operations securely.

3. **Token Program**

   - **Purpose:** Manages the issuance and distribution of voting and share tokens associated with each INC.
   - **Functionality:** Handles token initialization, transfers, minting, and burning, ensuring efficient shareholder and voting power management.
   - **Key Features:**
     - `initialize`: Sets up token accounts for voting and shares.
     - `transfer`, `mint`, `burn`: Manages token transactions and supply.

4. **Inccoin Program**

   - **Purpose:** Manages the issuance and transactions of the stablecoin **Inccoin** within the INC ecosystem.
   - **Functionality:** Facilitates the creation, distribution, and transfer of Inccoin, ensuring stability and security in financial operations.
   - **Key Features:**
     - `mint_inccoin`: Allows authorized entities to mint new Inccoin tokens.
     - `transfer_inccoin`: Enables seamless transfer of Inccoin between companies and stakeholders.
     - `burn_inccoin`: Handles the burning of Inccoin to manage supply and stability.

### Web3 Front-End Application

The front-end application provides an intuitive interface for users to interact with the INC smart contracts, enabling seamless management and participation in decentralized companies.

1. **Company Creation Wizard**

   - **Functionality:** Guides users through the process of creating a new INC with form validations and integration with the `create_company` instruction from the INC Factory Program.

2. **User Dashboard**

   - **Functionality:** Offers an overview of the user's associated companies, roles, pending proposals, and recent activities, enhancing user engagement and management efficiency.

3. **Company Pages**

   - **Public Page:** Displays transparent information about the company, including proposals, shareholder details, and key metrics.
   - **Private Page:** Provides authorized users with tools to manage proposals, treasury operations, and token distributions securely.

4. **Governance and Voting**

   - **Functionality:** Allows shareholders to create, view, and vote on proposals, facilitating decentralized decision-making and governance.

5. **Treasury Management**

   - **Functionality:** Enables secure deposit and transfer of funds, ensuring effective and transparent treasury operations.

6. **INC Stablecoin Management**

   - **Functionality:** Facilitates the minting, transferring, and burning of Inccoin, providing companies with a stable and reliable currency for their financial operations.

7. **Authentication and Security**
   - **Functionality:** Integrates with Solana wallets (e.g., Phantom, Solflare) for secure user authentication and transaction signing, ensuring only authorized actions are performed.

### Technology Stack

- **Smart Contracts:** Rust with the Anchor framework.
- **Front-End:** React (TypeScript), Vite.js, Tailwind CSS, shadcn/ui, React Router.
- **Blockchain Interaction:** Solana's Web3.js and Anchor client libraries.
- **State Management:** React Context API or alternatives.
- **Testing:** Jest, React Testing Library.
- **Tooling:** ESLint, Prettier for linting and formatting.

### Setup and Deployment

1. **Clone the Repository**

   ```bash
   git clone <repository_url>
   cd <repository_directory>
   ```

2. **Install Dependencies**

   - For Programs:
     ```bash
     cd programs/<program_name>
     npm install
     ```
   - For the App:
     ```bash
     cd app
     npm install
     ```

3. **Configure Environment**

   - Set up necessary environment variables and Solana network configurations as per the project requirements.

4. **Build and Deploy Smart Contracts**

   - Use Anchor CLI to build and deploy the smart contracts to the Solana blockchain.
     ```bash
     anchor build
     anchor deploy
     ```

5. **Run the Front-End Application**

   ```bash
   cd app
   npm run dev
   ```

6. **Testing**
   - Execute test suites to ensure the integrity and security of the smart contracts and front-end functionalities.
     ```bash
     anchor test
     npm test
     ```

### Security Measures

- **Access Control:** Utilizes Anchor's `#[access_control]` to enforce proper permissions.
- **Data Validation:** Implements constraint checks within Anchor to validate account data.
- **Secure Treasury Operations:** Ensures only authorized instructions can modify treasury funds.
- **Comprehensive Testing:** Employs Anchor's testing framework alongside other testing tools for thorough validation.
- **Audits:** Conducts security audits before mainnet deployment to identify and mitigate vulnerabilities.
- **Multisig Mechanisms:** Implements multisignature requirements for critical treasury and governance operations.

By integrating these components and adhering to best practices, INC provides a secure, efficient, and decentralized framework for modern organizations to operate transparently on the Solana blockchain.

## Unresolved issues

The main issue with the concept of Internet Native Companies (INC) lies in the tension between decentralization and real-world compliance. Although INCs streamline company creation and management on the blockchain, offering transparency, automation, and efficiency, they still face several challenges:

1. **Legal Recognition and Jurisdiction:** Traditional companies need to be registered under a legal jurisdiction to be recognized by governments and courts. INCs operate permissionlessly on the blockchain, bypassing this. However, without formal recognition, these companies may not be able to enforce contracts, protect intellectual property, or manage disputes in traditional legal systems.

2. **Regulatory Compliance:** While INCs aim to eliminate the complexity of navigating regulatory environments, businesses still need to comply with laws around taxes, employment, data protection, anti-money laundering (AML), and know-your-customer (KYC) requirements. Many jurisdictions have strict laws that INCs would struggle to meet without additional systems for compliance.

3. **Banking and Financial Integration:** INCs use blockchain-based tokens like Inccoin for treasury operations, but real-world businesses need integration with traditional financial systems, including banks for payroll, loans, and payments. The lack of established bridges between crypto-treasury systems and fiat banking could limit broader adoption.

4. **Governance and Security Risks:** The decentralized governance of INCs brings flexibility but also raises risks, such as shareholder disputes and vulnerabilities in smart contracts. Poorly designed governance mechanisms or security flaws in the smart contracts can result in exploitation or governance failure, as seen in various decentralized autonomous organizations (DAOs).

5. **Stability and Adoption:** The use of Solana blockchain and stablecoins like Inccoin might present technical and market risks. Blockchain networks may face outages, forks, or regulatory crackdowns, affecting the reliability and scalability of INCs.
