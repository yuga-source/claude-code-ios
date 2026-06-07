import SwiftUI
import AVFoundation
import SwiftData

struct BarcodeScannerView: View {
    @Environment(\.modelContext) private var modelContext
    @StateObject private var scanner = BarcodeScanner()

    @State private var scannedCode: String?
    @State private var showComparison = false
    @State private var showSaveSheet = false
    @State private var isTorchOn = false

    var body: some View {
        NavigationStack {
            ZStack {
                if scanner.isAuthorized {
                    CameraPreview(session: scanner.session)
                        .ignoresSafeArea()

                    VStack {
                        Spacer()
                        scanGuide
                        Spacer()
                        bottomPanel
                    }
                } else {
                    cameraPermissionView
                }
            }
            .navigationTitle("バーコードスキャン")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(.ultraThinMaterial, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        isTorchOn.toggle()
                        scanner.toggleTorch(isTorchOn)
                    } label: {
                        Image(systemName: isTorchOn ? "flashlight.on.fill" : "flashlight.off.fill")
                    }
                    .disabled(!scanner.isAuthorized)
                }
            }
            .onAppear { scanner.start() }
            .onDisappear { scanner.stop() }
            .onChange(of: scanner.lastScannedCode) { _, code in
                guard let code else { return }
                scannedCode = code
                showComparison = true
                scanner.pause()
            }
            .sheet(isPresented: $showComparison, onDismiss: {
                scanner.resume()
                scannedCode = nil
            }) {
                if let code = scannedCode {
                    PriceComparisonView(keyword: code, currentUnitPrice: nil, currentUnitBase: nil)
                }
            }
        }
    }

    private var scanGuide: some View {
        RoundedRectangle(cornerRadius: 12)
            .stroke(Color.white, lineWidth: 3)
            .frame(width: 260, height: 160)
            .overlay {
                if let code = scanner.lastScannedCode {
                    Text(code)
                        .font(.caption.monospaced())
                        .padding(6)
                        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 6))
                        .offset(y: 90)
                }
            }
    }

    private var bottomPanel: some View {
        VStack(spacing: 12) {
            Text("バーコードをスキャンしてください")
                .font(.subheadline)
                .foregroundStyle(.white)
        }
        .padding()
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16))
        .padding()
    }

    private var cameraPermissionView: some View {
        ContentUnavailableView(
            "カメラのアクセスが必要です",
            systemImage: "camera.fill",
            description: Text("設定アプリでカメラへのアクセスを許可してください")
        )
    }
}

@MainActor
final class BarcodeScanner: NSObject, ObservableObject {
    @Published var lastScannedCode: String?
    @Published var isAuthorized = false

    let session = AVCaptureSession()
    private var isPaused = false

    override init() {
        super.init()
        checkAuthorization()
    }

    private func checkAuthorization() {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            isAuthorized = true
            setupSession()
        case .notDetermined:
            Task {
                let granted = await AVCaptureDevice.requestAccess(for: .video)
                isAuthorized = granted
                if granted { setupSession() }
            }
        default:
            isAuthorized = false
        }
    }

    private func setupSession() {
        session.beginConfiguration()
        defer { session.commitConfiguration() }

        guard let device = AVCaptureDevice.default(for: .video),
              let input = try? AVCaptureDeviceInput(device: device),
              session.canAddInput(input) else { return }

        session.addInput(input)

        let output = AVCaptureMetadataOutput()
        guard session.canAddOutput(output) else { return }
        session.addOutput(output)
        output.setMetadataObjectsDelegate(self, queue: .main)
        output.metadataObjectTypes = [.ean8, .ean13, .qr, .upce, .code128]
    }

    func start() {
        guard !session.isRunning else { return }
        Task.detached { [session] in await session.startRunning() }
    }

    func stop() {
        guard session.isRunning else { return }
        Task.detached { [session] in await session.stopRunning() }
    }

    func pause() { isPaused = true }

    func resume() {
        isPaused = false
        lastScannedCode = nil
    }

    func toggleTorch(_ on: Bool) {
        guard let device = AVCaptureDevice.default(for: .video),
              device.hasTorch,
              let _ = try? device.lockForConfiguration() else { return }
        device.torchMode = on ? .on : .off
        device.unlockForConfiguration()
    }
}

extension BarcodeScanner: AVCaptureMetadataOutputObjectsDelegate {
    nonisolated func metadataOutput(
        _ output: AVCaptureMetadataOutput,
        didOutput metadataObjects: [AVMetadataObject],
        from connection: AVCaptureConnection
    ) {
        guard let object = metadataObjects.first as? AVMetadataMachineReadableCodeObject,
              let code = object.stringValue else { return }

        Task { @MainActor in
            guard !self.isPaused else { return }
            self.lastScannedCode = code
        }
    }
}
