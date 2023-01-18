import Task from './Task'
import Solution from './Solution'

export default class Knapsack {
    private tasks: Task[]
    private capacity: number

    constructor(tasks: Task[], capacity: number) {
        this.tasks = tasks
        this.capacity = capacity
    }

    public solve(): Solution {
        const numOfTasks = this.tasks.length
        const capacity = this.capacity

        const matrix = new Array<Array<number>>(numOfTasks + 1)
        for (let i = 0; i < matrix.length; i++)
            matrix[i] = new Array<number>(capacity + 1).fill(0)

        for (let i = 1; i <= numOfTasks; i++) {
            for (let j = 0; j <= capacity; j++) {
                if (this.tasks[i - 1].getWorkHours > j) {
                    matrix[i][j] = matrix[i - 1][j]
                } else {
                    matrix[i][j] = Math.max(
                        matrix[i - 1][j],
                        matrix[i - 1][j - this.tasks[i - 1].getWorkHours] +
                            this.tasks[i - 1].getValue
                    )
                }
            }
        }

        // for (let i = 1; i <= numOfTasks; i++) {
        //     const weight = this.tasks[i - 1].getWorkHours
        //     const value = this.tasks[i - 1].getValue
        //     for (let j = 1; j <= this.capacity; j++) {
        //         matrix[i][j] = matrix[i - 1][j]
        //         if (
        //             j >= weight &&
        //             matrix[i - 1][j - weight] + value > matrix[i][j]
        //         ) {
        //             matrix[i][j] = matrix[i - 1][j - weight] + value
        //         }
        //     }
        // }

        const tasksSolution = new Array<Task>()
        let numOfHours = 0
        let result = matrix[numOfTasks][capacity]
        let j = capacity

        for (let i = numOfTasks; i > 0 && result > 0; i--) {
            if (matrix[i - 1][j] !== result) {
                tasksSolution.push(this.tasks[i - 1])
                numOfHours += this.tasks[i - 1].getWorkHours

                result -= this.tasks[i - 1].getValue
                j -= this.tasks[i - 1].getWorkHours
            }
        }

        return new Solution(tasksSolution, matrix[numOfTasks][capacity], numOfHours)
    }
}
