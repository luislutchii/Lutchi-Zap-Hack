function extractBody(msg) {
  const m = msg.message;
  if (!m) return "";

  return (
    m?.conversation ||
    m?.extendedTextMessage?.text ||
    m?.imageMessage?.caption ||
    m?.videoMessage?.caption ||
    m?.documentMessage?.caption ||
    m?.buttonsResponseMessage?.selectedButtonId ||
    m?.listResponseMessage?.singleSelectReply?.selectedRowId ||
    m?.templateButtonReplyMessage?.selectedId ||
    m?.ephemeralMessage?.message?.conversation ||
    m?.ephemeralMessage?.message?.extendedTextMessage?.text ||
    m?.viewOnceMessage?.message?.conversation ||
    m?.viewOnceMessage?.message?.extendedTextMessage?.text ||
    m?.documentWithCaptionMessage?.message?.documentMessage?.caption ||
    m?.editedMessage?.message?.protocolMessage?.editedMessage?.conversation ||
    m?.editedMessage?.message?.protocolMessage?.editedMessage?.extendedTextMessage?.text ||
    ""
  );
}

module.exports = extractBody;
