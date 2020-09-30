import { AudioContext } from 'standardized-audio-context-mock'
import BragiDefault, { Bragi } from '../../../packages/bragi/src/index'

describe('Root Integration tests', () => {
    it('should Bragi is named exported', () => {
        expect(Bragi).toBeDefined()
    })

    it('should Bragi exported as default', () => {
        expect(BragiDefault).toBe(Bragi)
    })

    it('should Bragi run in not supported environment', () => {
        expect(new Bragi()).toBeInstanceOf(Bragi)
    })

    it('should Bragi run in not supported environment whit Ponyfill', () => {
        expect(
            new Bragi({
                ponyfills: {
                    AudioContext,
                },
            }),
        ).toBeInstanceOf(Bragi)
    })
})
