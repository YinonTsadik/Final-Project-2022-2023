import Day from './Day'
import Knapsack from './Knapsack'
import Task from './Task'
import * as db from '../db'

export default class Manager {
    private calendarID: string
    private allDays: Day[]
    private allTasks: Task[]

    constructor(calendarID: string) {
        this.calendarID = calendarID
        this.allDays = new Array<Day>()
        this.allTasks = new Array<Task>()
    }

    public async createManager() {
        const calendar = await db.getCalendar(this.calendarID)

        this.allDays = Day.generateCalendar(calendar.start_date, calendar.end_date)
        this.allDays.forEach((day: Day) => day.updateConstraints(this.calendarID))

        const dbTasks = await db.getCalendarTasks(this.calendarID)
        dbTasks?.forEach((dbTask: any) => {
            const task = new Task(
                dbTask.id,
                dbTask.description,
                dbTask.deadline,
                dbTask.work_hours
            )
            task.updateDetails(new Date())
            this.allTasks.push(task)
        })
    }

    public optimize() {
        db.deleteCalendarScheduledTasks(this.calendarID)

        this.allDays.forEach((day: Day) => {
            const options = new Array<Task>()
            const availableHours = day.getAvailableHours

            this.allTasks.forEach((task: Task) => {
                if (!task.getFullyScheduled) {
                    const tempTask = Task.copyConstructor(task)
                    tempTask.updateDetails(day.getDate)

                    if (task.getWorkHours <= availableHours) {
                        options.push(tempTask)
                    } else {
                        options.push(tempTask.splitTask(availableHours))
                    }
                }
            })

            const dayKnapsack = new Knapsack(options, availableHours)
            const daySolution = dayKnapsack.solve()

            if (daySolution.getHours > availableHours) {
                throw new Error('Knapsack Error')
            }

            // day.tasksScheduling(this.calendarID, daySolution.getTasks)
            day.setAvailableHours = day.getAvailableHours - daySolution.getHours
            day.setTotalValue = daySolution.getValue

            for (let i = 0; i < daySolution.getTasks.length; i++) {
                const solutionTask = daySolution.getTasks[i]
                for (let j = 0; j < this.allTasks.length; j++) {
                    if (this.allTasks[j].getID === solutionTask.getID) {
                        const originalTask = this.allTasks[j]
                        if (originalTask.getWorkHours <= availableHours) {
                            originalTask.setFullyScheduled = true
                        } else {
                            this.allTasks.splice(
                                j,
                                1,
                                originalTask.splitTask(
                                    originalTask.getWorkHours - availableHours
                                )
                            )
                        }
                        break
                    }
                }
            }
        })
    }

    get getAllDays() {
        return this.allDays
    }

    get getAllTasks() {
        return this.allTasks
    }
}
