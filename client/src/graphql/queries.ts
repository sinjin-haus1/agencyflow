import { gql } from '@apollo/client';

// Auth
export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(loginUserInput: { email: $email, password: $password }) {
      token
      user {
        id
        email
        name
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!, $name: String) {
    register(registerUserInput: { email: $email, password: $password, name: $name }) {
      token
      user {
        id
        email
        name
      }
    }
  }
`;

// Clients
export const GET_CLIENTS = gql`
  query GetClients {
    clients {
      id
      name
      email
      phone
      company
      address
      notes
      createdAt
    }
  }
`;

export const CREATE_CLIENT = gql`
  mutation CreateClient($name: String!, $email: String!, $phone: String, $company: String, $address: String, $notes: String) {
    createClient(createClientInput: { name: $email, email: $email, phone: $phone, company: $company, address: $address, notes: $notes }) {
      id
      name
      email
    }
  }
`;

export const UPDATE_CLIENT = gql`
  mutation UpdateClient($id: String!, $name: String, $email: String, $phone: String, $company: String, $address: String, $notes: String) {
    updateClient(updateClientInput: { id: $id, name: $name, email: $email, phone: $phone, company: $company, address: $address, notes: $notes }) {
      id
      name
      email
    }
  }
`;

export const DELETE_CLIENT = gql`
  mutation DeleteClient($id: String!) {
    removeClient(id: $id)
  }
`;

// Projects
export const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      name
      description
      status
      clientId
      budget
      hourlyRate
      createdAt
    }
  }
`;

export const CREATE_PROJECT = gql`
  mutation CreateProject($name: String!, $description: String, $status: String, $clientId: String, $budget: Float, $hourlyRate: Float) {
    createProject(createProjectInput: { name: $name, description: $description, status: $status, clientId: $clientId, budget: $budget, hourlyRate: $hourlyRate }) {
      id
      name
      status
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: String!, $name: String, $description: String, $status: String, $clientId: String, $budget: Float, $hourlyRate: Float) {
    updateProject(updateProjectInput: { id: $id, name: $name, description: $description, status: $status, clientId: $clientId, budget: $budget, hourlyRate: $hourlyRate }) {
      id
      name
      status
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: String!) {
    removeProject(id: $id)
  }
`;

// Time Entries
export const GET_TIME_ENTRIES = gql`
  query GetTimeEntries {
    timeEntries {
      id
      description
      startTime
      endTime
      duration
      billable
      projectId
    }
  }
`;

export const CREATE_TIME_ENTRY = gql`
  mutation CreateTimeEntry($description: String!, $projectId: String, $billable: Boolean) {
    createTimeEntry(createTimeEntryInput: { description: $description, projectId: $projectId, billable: $billable }) {
      id
      description
      startTime
    }
  }
`;

export const START_TIMER = gql`
  mutation StartTimer($description: String!, $projectId: String, $billable: Boolean) {
    startTimer(startTimerInput: { description: $description, projectId: $projectId, billable: $billable }) {
      id
      description
      startTime
    }
  }
`;

export const STOP_TIMER = gql`
  mutation StopTimer($id: String!) {
    stopTimer(id: $id) {
      id
      endTime
      duration
    }
  }
`;

export const DELETE_TIME_ENTRY = gql`
  mutation DeleteTimeEntry($id: String!) {
    removeTimeEntry(id: $id)
  }
`;

// Invoices
export const GET_INVOICES = gql`
  query GetInvoices {
    invoices {
      id
      invoiceNumber
      clientId
      projectId
      status
      subtotal
      tax
      total
      dueDate
      paidDate
      notes
      createdAt
    }
  }
`;

export const CREATE_INVOICE = gql`
  mutation CreateInvoice($clientId: String!, $projectId: String, $dueDate: String, $notes: String) {
    createInvoice(createInvoiceInput: { clientId: $clientId, projectId: $projectId, dueDate: $dueDate, notes: $notes }) {
      id
      invoiceNumber
      status
    }
  }
`;

export const UPDATE_INVOICE = gql`
  mutation UpdateInvoice($id: String!, $status: String, $notes: String) {
    updateInvoice(updateInvoiceInput: { id: $id, status: $status, notes: $notes }) {
      id
      status
    }
  }
`;

export const MARK_INVOICE_PAID = gql`
  mutation MarkInvoicePaid($id: String!) {
    markAsPaid(id: $id) {
      id
      status
      paidDate
    }
  }
`;

export const DELETE_INVOICE = gql`
  mutation DeleteInvoice($id: String!) {
    removeInvoice(id: $id)
  }
`;
