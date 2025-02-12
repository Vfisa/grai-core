import userEvent from "@testing-library/user-event"
import { GraphQLError } from "graphql"
import { act, render, screen, waitFor } from "testing"
import EditScheduleForm, { UPDATE_CONNECTION } from "./EditScheduleForm"

const connection = {
  id: "1",
  schedules: null,
  is_active: false,
  namespace: "default",
  name: "c1",
  metadata: {},
  connector: {
    metadata: {},
  },
}

test("renders", async () => {
  render(<EditScheduleForm connection={connection} />)

  expect(screen.getByText("Schedule type")).toBeInTheDocument()
})

test("renders with schedule", async () => {
  const connection = {
    id: "1",
    schedules: {
      type: "cron",
    },
    is_active: false,
    namespace: "default",
    name: "c1",
    metadata: {},
    connector: {
      metadata: {},
    },
  }

  render(<EditScheduleForm connection={connection} />)

  expect(screen.getByText("Schedule type")).toBeInTheDocument()
})

test("submit", async () => {
  const user = userEvent.setup()

  render(<EditScheduleForm connection={connection} />)

  expect(screen.getByText("Schedule type")).toBeInTheDocument()

  await act(
    async () => await user.click(screen.getByRole("button", { name: /save/i }))
  )
})

test("submit cron", async () => {
  const user = userEvent.setup()

  render(<EditScheduleForm connection={connection} />)

  expect(screen.getByText("Schedule type")).toBeInTheDocument()

  await act(
    async () => await user.click(screen.getByLabelText("Cron expression"))
  )

  await act(
    async () =>
      await user.type(screen.getByRole("textbox", { name: /minutes/i }), "30")
  )
  await act(
    async () =>
      await user.type(screen.getByRole("textbox", { name: /hours/i }), "1")
  )
  await act(
    async () =>
      await user.type(
        screen.getByRole("textbox", { name: /days of the week/i }),
        "1"
      )
  )
  await act(
    async () =>
      await user.type(
        screen.getByRole("textbox", { name: /days of the month/i }),
        "2"
      )
  )
  await act(
    async () =>
      await user.type(
        screen.getByRole("textbox", { name: /months of the year/i }),
        "3"
      )
  )
  await act(async () => await user.click(screen.getByLabelText("Enabled")))

  await act(
    async () => await user.click(screen.getByRole("button", { name: /save/i }))
  )
})

test("submit dbt cloud", async () => {
  const user = userEvent.setup()

  const connection = {
    id: "1",
    schedules: {
      type: "cron",
    },
    is_active: false,
    namespace: "default",
    name: "c1",
    metadata: {},
    connector: {
      metadata: {
        schedules: ["dbt-cloud"],
      },
    },
  }

  render(<EditScheduleForm connection={connection} />)

  expect(screen.getByText("Schedule type")).toBeInTheDocument()

  await act(async () => await user.click(screen.getByLabelText("dbt Cloud")))

  await act(
    async () =>
      await user.type(screen.getByRole("textbox", { name: /job id/i }), "1234")
  )

  await act(async () => await user.click(screen.getByLabelText("Enabled")))

  await act(
    async () => await user.click(screen.getByRole("button", { name: /save/i }))
  )
})

test("error", async () => {
  const user = userEvent.setup()

  const mocks = [
    {
      request: {
        query: UPDATE_CONNECTION,
        variables: {
          id: "1",
          schedules: null,
          is_active: false,
          namespace: "default",
          name: "c1",
          metadata: {},
          secrets: {},
          connector: {
            metadata: {},
          },
        },
      },
      result: {
        errors: [new GraphQLError("Error!")],
      },
    },
  ]

  render(<EditScheduleForm connection={connection} />, { mocks })

  expect(screen.getByText("Schedule type")).toBeInTheDocument()

  await act(
    async () => await user.click(screen.getByRole("button", { name: /save/i }))
  )

  await waitFor(() => {
    expect(screen.getByText("Error!")).toBeInTheDocument()
  })
})
