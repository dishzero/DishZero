import { waitFor } from '@testing-library/react'
import fetchMock from 'fetch-mock'

const apiAddress = process.env.REACT_APP_BACKEND_ADDRESS

describe('Admin Email Page', () => {
    it('should be true', () => {
        expect(true).toBe(true)
    })

    describe('initial render', () => {
        it('should initially have the template from the backend', () => {
            // do testing for it, clicking buttons

            // render(<Router/>)
            // a mock response from the backend
            fetchMock.sandbox().get(`${apiAddress}/api/cron/email/`, {
                status: 200,
                body: {
                    cron: {
                        body: 'A mock email body for testing',
                        subject: 'A mock email subject for testing',
                        cronExpression: '0 0 12 * * WED',
                        enabled: true,
                    },
                },
            })

            waitFor(() => {
                expect(fetchMock.called()).toBe(true)
            })
        })
    })
})
