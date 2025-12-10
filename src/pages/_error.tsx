import { NextPageContext } from 'next'

function Error({ statusCode }: { statusCode: number }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900">
            <h1 className="text-6xl font-bold mb-4">{statusCode ? statusCode : 'Error'}</h1>
            <p className="text-xl text-gray-600">
                {statusCode
                    ? `An error ${statusCode} occurred on server`
                    : 'An error occurred on client'}
            </p>
        </div>
    )
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404
    return { statusCode }
}

export default Error
