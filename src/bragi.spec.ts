import { AudioContext } from 'standardized-audio-context-mock'
import BragiDefault, { Bragi } from '.'

describe('Bragi Integration Tests', () => {
    it('should Bragi is named exported', () => {
        expect(Bragi).toBeDefined()
    })

    it('should Bragi exported as default', () => {
        expect(BragiDefault).toBe(Bragi)
    })

    it('should Bragi throw not supported environment', () => {
        expect(() => new Bragi()).toThrowError(
            `This browser not have support to AudioContext, please add a ponyfill.`,
        )
    })

    it('should Bragi run in not supported environment whit Ponyfill', () => {
        expect(new Bragi({ ponyfill: { AudioContext } })).toBeInstanceOf(Bragi)
    })
})

// describe('Bragi Unit Tests', () => {})
