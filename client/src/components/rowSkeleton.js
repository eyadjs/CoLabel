import React from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'

function RowSkeleton({rows}) {
  return (
      Array(rows).fill(0).map(item =>    ( <div className='rowSkeleton'>
        <SkeletonTheme baseColor='#202020' highlightColor='#444' height={25}>
          <Skeleton style={{marginBottom: "0.58rem"}}/>
        </SkeletonTheme>
      </div>))
  )
}

export default RowSkeleton