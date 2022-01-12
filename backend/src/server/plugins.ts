/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

const plugins = [
  {
    requestDidStart() {
      return {
        willSendResponse(requestContext: any) {
          const { setHeaders = [] } = requestContext.context
          setHeaders.forEach(({ key, value }: { [key: string]: string }) => {
            if (requestContext.response.http.headers.get(key)) {
              requestContext.response.http.headers.set(key, value)
            } else {
              requestContext.response.http.headers.append(key, value)
            }
          })
          return requestContext
        },
      }
    },
  },
]

export default plugins
