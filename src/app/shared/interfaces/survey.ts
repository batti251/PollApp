export interface Survey {
    name: string,
    endDate?: string,
    description?: string,
    category: string,
    question: {
        id: number,
        text: string,
        answers: {
            id: number,
            text: string,
            multipleChoice: boolean
        }[]
    }[]
}
