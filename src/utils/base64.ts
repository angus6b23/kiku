export async function blobToBase64(blob: Blob) {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(blob)
    })
}

export async function base64ToBlob(data: string) {
    const base64Response = await fetch(data)
    return await base64Response.blob()
}
