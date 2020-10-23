/* eslint-disable @typescript-eslint/no-explicit-any */
import { AudioContext } from 'standardized-audio-context-mock'
import BragiDefault, { Bragi } from '../../../packages/bragi/src/index'

describe('Integration tests', () => {
    it('should Bragi is named exported', () => {
        expect(Bragi).to.not.be.undefined
    })

    it('should Bragi exported as default', () => {
        expect(BragiDefault).to.deep.equal(Bragi)
    })

    it('should Bragi run without ponyfill', () => {
        expect(new Bragi()).to.be.an.instanceOf(Bragi)
    })

    it('should Bragi run with Ponyfill', () => {
        Bragi.setPonyfills({
            AudioContext,
        })
        expect(new Bragi()).to.be.an.instanceOf(Bragi)
    })

    it('should Bragi ignore duble set of Ponyfill', () => {
        const ponyfill = Bragi.setPonyfills({
            AudioContext: null as any,
        })
        expect(ponyfill.AudioContext).to.be.equal(AudioContext)
    })
})

const basicSource = {
    label: 'test',
    origin: 'test.mp3',
}

// let nodes: readonly symbol[]
describe('Unit tests', () => {
    describe('Sources manager', () => {
        it('should to be possible add a source', () => {
            const audioGroup = new Bragi()

            audioGroup.addSource(basicSource)

            expect(audioGroup.inspect(false).sources).to.be.equal(1)
        })

        it('should to be possible add sources', () => {
            const audioGroup = new Bragi()

            audioGroup.addSource(basicSource, basicSource, basicSource)

            expect(audioGroup.inspect(false).sources).to.be.equal(3)
        })

        it('should to be supported add sources up to 2 in depth', () => {
            const audioGroup = new Bragi()

            audioGroup.addSource(basicSource, [basicSource, basicSource], basicSource, basicSource)

            expect(audioGroup.inspect(false).sources).to.be.equal(5)
        })

        it('should add source return flat array with IDs (Symbols)', () => {
            const audioGroup = new Bragi()

            const [one, two, three, four, five] = audioGroup.addSource(
                {
                    label: 'test 1',
                    origin: 'test.mp3',
                },
                [
                    {
                        label: 'test 2',
                        origin: 'test.mp3',
                    },
                    {
                        label: 'test 3',
                        origin: 'test.mp3',
                    },
                ],
                {
                    label: 'test 4',
                    origin: 'test.mp3',
                },
                {
                    label: 'test 5',
                    origin: 'test.mp3',
                },
            )

            expect(one.toString()).to.be.equal('Symbol(test 1)')
            expect(two.toString()).to.be.equal('Symbol(test 2)')
            expect(three.toString()).to.be.equal('Symbol(test 3)')
            expect(four.toString()).to.be.equal('Symbol(test 4)')
            expect(five.toString()).to.be.equal('Symbol(test 5)')
        })

        it('should to be supported complex origin declaration', () => {
            const audioGroup = new Bragi()

            audioGroup.addSource(
                {
                    label: 'test-simple',
                    origin: 'test.mp3',
                },
                {
                    label: 'test-without-extension',
                    origin: ['mp3', 'mp3-file'],
                },
                {
                    label: 'test-with-ignored-extension',
                    origin: ['aac', 'acc.mp3'],
                },
                {
                    label: 'test-with-multiple-files',
                    origin: ['first.mp3', 'second.acc'],
                },
                {
                    label: 'test-with-multiple-files',
                    origin: [
                        ['dolby', 'dolby.mp4'],
                        ['mp3', 'mp3-file'],
                        ['caf', 'caf.mp3'],
                    ],
                },
            )

            expect(audioGroup.inspect(false).sources).to.be.equal(5)
        })

        it('should is possible remove a specific source', () => {
            const audioGroup = new Bragi()

            const [source] = audioGroup.addSource(
                basicSource,
                basicSource,
                basicSource,
                basicSource,
            )

            expect(audioGroup.inspect(false).sources).to.be.equal(4)

            audioGroup.removeSource(source)

            expect(audioGroup.inspect(false).sources).to.be.equal(3)
        })

        it('should to be possible remove a array of sources', () => {
            const audioGroup = new Bragi()

            const sourcesToRemove = audioGroup.addSource(
                basicSource,
                [basicSource, basicSource, basicSource],
                basicSource,
                basicSource,
            )

            audioGroup.addSource(
                [basicSource, basicSource],
                [basicSource, basicSource],
                [basicSource, basicSource],
            )

            expect(audioGroup.inspect(false).sources).to.be.equal(12)

            audioGroup.removeSource(sourcesToRemove)

            expect(audioGroup.inspect(false).sources).to.be.equal(6)
        })
    })
})
