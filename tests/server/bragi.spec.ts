import { AudioContext } from 'standardized-audio-context-mock'
import BragiDefault, { Bragi } from '../../src'

describe('Root Integration tests', () => {
    it('should Bragi is named exported', () => {
        expect(Bragi).toBeDefined()
    })

    it('should Bragi exported as default', () => {
        expect(BragiDefault).toBe(Bragi)
    })

    it('should Bragi throw not supported environment', () => {
        expect(() => new Bragi()).toThrowError(
            'Ponyfill is required in not browser environments, please add ponyfills.',
        )
    })

    it('should Bragi run in not supported environment whit Ponyfill', () => {
        expect(new Bragi({ ponyfill: { AudioContext } })).toBeInstanceOf(Bragi)
    })
})
