import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useRef } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  confirmText?: string
  onConfirm?: () => void
  cancelText?: string
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  confirmText = 'Confirm',
  onConfirm,
  cancelText = 'Cancel',
}: ModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onClose}
        initialFocus={cancelButtonRef}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 md:p-8 text-left align-middle shadow-2xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-semibold leading-6 text-gray-900 mb-6"
                >
                  {title}
                </Dialog.Title>

                <div className="mt-2">{children}</div>

                <div className="mt-8 flex justify-end gap-4">
                  <button
                    type="button"
                    ref={cancelButtonRef}
                    className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                    onClick={onClose}
                  >
                    {cancelText}
                  </button>

                  {onConfirm && (
                    <button
                      type="button"
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
                      onClick={() => {
                        onConfirm()
                        onClose()
                      }}
                    >
                      {confirmText}
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}