import './Dialog.css'

export function DialogBottom({ element }) {
    return (
        <>
            <div id='dialog-bottom-pile'></div>
            <div id='dialog-bottom'>
                {element}
            </div>
        </>
    )
}